import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { KanbanService } from '../services/kanban.service';
import { Kanban } from '../model/kanban.model';
import { Comment } from '../model/Comment.model';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../core/layout/layout.component';
import { Task, TaskPriority, TaskStatus } from '../model/Task.model';
import { FilterPipe } from '../pipes/filter.pipe';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    ReactiveFormsModule,
    FormsModule,
    FilterPipe,
    TitleCasePipe,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  providers: [TitleCasePipe],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  user: any;
  projectId!: number;
  project: Kanban | null = null;
  tasks: Task[] = [];
  isLoading = false;
  error: string | null = null;

  // Form state
  taskForm!: FormGroup;
  newComment: string = ''; // Contient le contenu du nouveau commentaire
  showTaskForm = false;
  isEditingTask = false;
  currentTask: Task | null = null;
  isSavingTask = false;
  assigneeNotFoundError: string | null = null;

  // Pour utilisation dans le template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  // Pour les filtres
  searchText: string = '';
  showOverdueTasks: boolean = false;

  private routeSubscription: Subscription | null = null;
  private projectSubscription: Subscription | null = null;
  private tasksSubscription: Subscription | null = null;
  private saveTaskSubscription: Subscription | null = null;
  private saveCommentSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Vérifier token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.initTaskForm(); // Initialiser le formulaire

    // S'abonner aux paramètres de la route
    this.routeSubscription = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.projectId = +id;
        this.loadProjectDetails(); // Charger projet ET tâches
      } else {
        this.error = 'ID de projet invalide.';
        console.error('ID de projet manquant dans les paramètres de route');
      }
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites mémoire
    this.routeSubscription?.unsubscribe();
    this.projectSubscription?.unsubscribe();
    this.tasksSubscription?.unsubscribe();
    this.saveTaskSubscription?.unsubscribe();
    this.saveCommentSubscription?.unsubscribe();
    // Supprimer les messages toast restants
    document
      .querySelectorAll('.toast-notification, .saving-message')
      .forEach((el) => el.remove());
  }

  loadProjectDetails(): void {
    this.isLoading = true;
    this.error = null; // Reset error
    this.projectSubscription = this.kanbanService
      .getKanbanById(this.projectId)
      .subscribe({
        next: (project) => {
          this.project = project;
          this.loadTasks(); // Charger les tâches APRÈS avoir chargé le projet
        },
        error: (err: any) => {
          this.handleLoadingError(err, 'Erreur lors du chargement du projet');
        },
      });
  }

  loadTasks(): void {
    if (!this.projectId) return;

    this.isLoading = true;
    this.tasksSubscription = this.kanbanService
      .getTasksByKanbanId(this.projectId)
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks.map((task) => {
            this.normalizeTaskData(task);
            return task;
          });
          console.log("*******this.tasks********",this.tasks)
          this.isLoading = false; // Chargement terminé
        },
        error: (err: any) => {
          this.handleLoadingError(err, 'Erreur lors du chargement des tâches');
        },
      });
      
  }

  private handleLoadingError(err: any, defaultMessage: string): void {
    this.error = err.error?.message || err.message || defaultMessage;
    this.isLoading = false;
    console.error(defaultMessage, err);
    if (err.status === 401 || err.status === 403) {
      this.router.navigate(['/auth/sign-in']);
    }
  }

  initTaskForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      status: [TaskStatus.TODO, [Validators.required]],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      deadline: [null],
      assigneeEmail: [null, [Validators.email]], // Champ pour l'UI et l'envoi séparé
      storyPoints: [null, [Validators.min(0)]],
      color: ['#6366f1'],
      comments: [[]],
      comment: ['']  // <= champ temporaire pour la saisie
    });
    this.assigneeNotFoundError = null;
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.deadline || task.status === TaskStatus.DONE) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  }

  filterTasks(): void {
    // Le pipe gère le filtrage dans le template
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-progress';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return '';
    }
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'priority-low';
      case TaskPriority.MEDIUM:
        return 'priority-medium';
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.URGENT:
        return 'priority-urgent';
      default:
        return '';
    }
  }

  openTaskForm(): void {
    this.isEditingTask = false;
    this.currentTask = null;
    this.taskForm.reset({
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      color: '#6366f1',
      title: '',
      description: '',
      deadline: null,
      assigneeEmail: null,
      storyPoints: null,
      comments: [] 
    });
    this.assigneeNotFoundError = null;
    this.showTaskForm = true;
  }

  openEditTaskForm(task: Task): void {
    this.isEditingTask = true;
    this.currentTask = task;
    this.assigneeNotFoundError = null;

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : null,
      assigneeEmail: task.assignee?.email || null, // Utiliser l'email existant
      storyPoints: task.storyPoints,
      color: task.color || '#6366f1',
      comments: task.comments,
    });
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.taskForm.reset();
    this.assigneeNotFoundError = null;
    this.isSavingTask = false;
    this.saveTaskSubscription?.unsubscribe();
    this.saveCommentSubscription?.unsubscribe();
  }

  addComment(): void {
  const content = this.taskForm.get('comment')?.value?.trim();
  if (!content) return;
  this.user = this.kanbanService.getCurrentUser();
  const newComment: Comment = {
    //id: 0,
    content: content,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: this.user.id,
      username: this.user.username,
      email: this.user.email,
    }
  };
  
 /*  const newComment = {
    content,
    createdAt: new Date(),

    // Ajoute ici l’auteur si tu veux : author: { id, name }
  }; */

  const updatedComments = [...(this.taskForm.get('comments')?.value || []), newComment];

  this.taskForm.patchValue({
    comments: updatedComments,
    comment: '' // Réinitialise le champ
  });
}


  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSavingTask = true;
    this.assigneeNotFoundError = null;

    // Créer l'objet Task à envoyer dans le corps de la requête
    const taskPayload: Task = {
      ...(this.isEditingTask &&
        this.currentTask?.id && { id: this.currentTask.id }),
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      status: this.taskForm.value.status,
      priority: this.taskForm.value.priority,
      deadline: this.taskForm.value.deadline || undefined,
      color: this.taskForm.value.color || '#6366f1',
      storyPoints: this.taskForm.value.storyPoints || undefined,
      comments: this.taskForm.get('comments')?.value
    };

    // Extraire l'email pour l'envoyer séparément en paramètre
    const assigneeEmail = this.taskForm.value.assigneeEmail || null;

    console.log('Payload Tâche:', taskPayload);
    console.log('Email Assigné:', assigneeEmail);

    this.saveTaskSubscription?.unsubscribe();
    

    if (this.isEditingTask && this.currentTask?.id) {
      this.saveTaskSubscription = this.kanbanService
        .updateTask(this.currentTask.id, taskPayload, assigneeEmail)
        .subscribe({
          next: (updatedTask: Task) =>
            this.handleTaskSaveSuccess(
              updatedTask,
              'Tâche mise à jour avec succès'
            ),
          error: (err) => this.handleTaskSaveError(err),
        });
    } else {
      this.saveTaskSubscription = this.kanbanService
        .createTask(this.projectId, taskPayload, assigneeEmail)
        .subscribe({
          next: (newTask: Task) =>
            this.handleTaskSaveSuccess(newTask, 'Tâche créée avec succès'),
          error: (err) => this.handleTaskSaveError(err),
        });
    }
    this.loadProjectDetails(); // Charger projet ET tâches
  }

  private normalizeTaskData(taskData: any): void {
    if (typeof taskData.status === 'string') {
      taskData.status =
        TaskStatus[taskData.status.toUpperCase() as keyof typeof TaskStatus] ||
        TaskStatus.TODO;
    } else if (!Object.values(TaskStatus).includes(taskData.status)) {
      taskData.status = TaskStatus.TODO;
    }
    if (typeof taskData.priority === 'string') {
      taskData.priority =
        TaskPriority[
          taskData.priority.toUpperCase() as keyof typeof TaskPriority
        ] || TaskPriority.MEDIUM;
    } else if (!Object.values(TaskPriority).includes(taskData.priority)) {
      taskData.priority = TaskPriority.MEDIUM;
    }
    if (taskData.assignee && typeof taskData.assignee !== 'object') {
      taskData.assignee = undefined;
    }
  }

  private handleTaskSaveSuccess(task: Task, message: string): void {
    console.log('Succès:', task);
    this.normalizeTaskData(task);

    if (this.isEditingTask) {
      const index = this.tasks.findIndex((t) => t.id === task.id);
      if (index !== -1) this.tasks[index] = task;
    } else {
      this.tasks.push(task);
    }
    this.tasks = [...this.tasks];

    this.isSavingTask = false;
    this.closeTaskForm();

    this.showToastNotification(message, 'success');
  }

  private handleTaskSaveError(error: any): void {
    console.error('Erreur enregistrement tâche:', error);
    this.isSavingTask = false;

    let errorMessage = "Erreur lors de l'enregistrement.";
    if (error.status === 404 && error.error?.message) {
      errorMessage = error.error.message;
      if (errorMessage.toLowerCase().includes('utilisateur non trouvé')) {
        this.assigneeNotFoundError = errorMessage;
        this.taskForm.get('assigneeEmail')?.setErrors({ notFound: true });
        this.taskForm.get('assigneeEmail')?.markAsTouched();
      }
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.showToastNotification(errorMessage, 'error');
  }

  private showToastNotification(
    message: string,
    type: 'success' | 'error'
  ): void {
    document
      .querySelectorAll(`.toast-notification.${type}`)
      .forEach((el) => el.remove());

    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}
