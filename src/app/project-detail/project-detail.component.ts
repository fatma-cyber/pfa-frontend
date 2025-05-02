import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { KanbanService, Kanban } from '../services/kanban.service';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../core/layout/layout.component';
import { Task, TaskPriority, TaskStatus } from '../model/Task.model';
import { FilterPipe } from '../pipes/filter.pipe';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, LayoutComponent, ReactiveFormsModule, FormsModule, FilterPipe],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectId!: number;
  project: Kanban | null = null;
  tasks: Task[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Form state
  taskForm!: FormGroup;
  showTaskForm = false;
  isEditingTask = false;
  currentTask: Task | null = null;
  isSavingTask = false;
  availableUsers: any[] = [];
  
  // Pour utilisation dans le template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  // Pour les filtres
  searchText: string = '';
  showOverdueTasks: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initTaskForm();
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('auth-token');
    console.log('Token présent:', !!token);
    
    if (!token) {
      console.error('Aucun token trouvé - utilisateur non authentifié');
      // Rediriger vers la page de connexion
      this.router.navigate(['/auth/sign-in']);
      return;
    }
    
    // Continuer avec le chargement des données...
    this.loadProjectDetails();
    this.loadTasks();
  }

  loadProjectDetails(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = +id;
        this.loadProject();
        this.loadTasks();
        this.loadUsers();
      }
    });
  }

  loadProject(): void {
    this.isLoading = true;
    this.kanbanService.getKanbanById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement du projet';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.kanbanService.getTasksByKanbanId(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des tâches';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  loadUsers(): void {
    // Charger les utilisateurs disponibles pour assignation
    this.userService.getUsers().subscribe({
      next: (users: any[]) => {
        this.availableUsers = users;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }
  
  initTaskForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [TaskStatus.TODO, [Validators.required]],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      deadline: [null],
      assigneeId: [null],
      storyPoints: [null],
      color: ['#6366f1'] // Couleur par défaut
    });
  }
  
  // Détermine si une tâche est en retard
  isTaskOverdue(task: Task): boolean {
    if (!task.deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today && task.status !== TaskStatus.DONE;
  }
  
  // Filtre global pour la recherche
  filterTasks(): void {
    // La méthode est appelée par l'input de recherche
    // La logique de filtrage est dans getTasksByStatus
  }
  
  // Classes pour les badges
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'status-todo';
      case TaskStatus.IN_PROGRESS: return 'status-progress';
      case TaskStatus.DONE: return 'status-done';
      default: return '';
    }
  }
  
  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.URGENT: return 'priority-urgent';
      default: return '';
    }
  }

  openTaskForm(): void {
    this.isEditingTask = false;
    this.currentTask = null;
    this.taskForm.reset({
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      color: '#6366f1'
    });
    
    console.log('Ouverture du formulaire');
    this.showTaskForm = true;
  }

  openEditTaskForm(task: Task): void {
    this.isEditingTask = true;
    this.currentTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : null,
      assigneeId: task.assignee?.id || null,
      storyPoints: task.storyPoints || null,
      color: task.color || '#6366f1'
    });
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    console.log('Fermeture formulaire');
    this.showTaskForm = false;
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    
    this.isSavingTask = true;
    
    // Format correct pour le backend
    const taskData = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      status: this.taskForm.value.status.toString(), // Important: envoyer en tant que string
      priority: this.taskForm.value.priority.toString(), // Important: envoyer en tant que string
      deadline: this.taskForm.value.deadline,
      color: this.taskForm.value.color || '#6366f1',
      storyPoints: this.taskForm.value.storyPoints || 0,
      kanban: { id: this.projectId }, // Le backend attend un objet kanban avec un id
      ...(this.taskForm.value.assigneeId ? { assignee: { id: this.taskForm.value.assigneeId } } : {}) // Ajouter l'assignee conditionnellement
    };
    
    console.log('Données tâche à envoyer:', taskData);
    
    // Message de chargement
    const savingMessage = document.createElement('div');
    savingMessage.className = 'saving-message';
    savingMessage.textContent = this.isEditingTask ? 'Mise à jour...' : 'Création...';
    document.body.appendChild(savingMessage);
  
    if (this.isEditingTask && this.currentTask?.id) {
      this.kanbanService.updateTask(this.currentTask.id, taskData).subscribe({
        next: (updatedTask: Task) => {
          console.log('Tâche mise à jour:', updatedTask);
          // Convertir les chaînes en enums pour l'affichage
          this.normalizeTaskData(updatedTask);
          
          // Mettre à jour la tâche dans le tableau local
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          
          // Forcer la détection de changement
          this.tasks = [...this.tasks];
          
          this.isSavingTask = false;
          this.showTaskForm = false;
          savingMessage.remove();
          
          // Notification de succès
          const notification = document.createElement('div');
          notification.className = 'toast-notification success';
          notification.textContent = 'Tâche mise à jour avec succès';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.handleTaskSaveError(err, savingMessage);
        }
      });
    } else {
      // Création d'une nouvelle tâche
      this.kanbanService.createTask(this.projectId, taskData).subscribe({
        next: (newTask: Task) => {
          console.log('Nouvelle tâche créée:', newTask);
          
          // Convertir les chaînes en enums pour l'affichage
          this.normalizeTaskData(newTask);
          
          // Ajouter la tâche au tableau local
          this.tasks.push(newTask);
          
          // Forcer la détection de changement
          this.tasks = [...this.tasks];
          
          // Fermer le formulaire et nettoyer
          this.isSavingTask = false;
          this.showTaskForm = false;
          savingMessage.remove();
          
          // Notification de succès
          const notification = document.createElement('div');
          notification.className = 'toast-notification success';
          notification.textContent = 'Tâche créée avec succès';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.handleTaskSaveError(err, savingMessage);
        }
      });
    }
  }

  private normalizeTaskData(taskData: any): void {
    // Traitement du statut
    if (typeof taskData.status === 'string') {
      console.log('Status avant normalisation:', taskData.status);
      switch(taskData.status.toUpperCase()) {
        case 'TODO':
          taskData.status = TaskStatus.TODO;
          break;
        case 'IN_PROGRESS':
          taskData.status = TaskStatus.IN_PROGRESS;
          break;
        case 'DONE':
          taskData.status = TaskStatus.DONE;
          break;
        default:
          taskData.status = TaskStatus.TODO;
      }
      console.log('Status après normalisation:', taskData.status);
    }
    
    // Traitement de la priorité
    if (typeof taskData.priority === 'string') {
      console.log('Priorité avant normalisation:', taskData.priority);
      switch(taskData.priority.toUpperCase()) {
        case 'LOW':
          taskData.priority = TaskPriority.LOW;
          break;
        case 'MEDIUM':
          taskData.priority = TaskPriority.MEDIUM;
          break;
        case 'HIGH':
          taskData.priority = TaskPriority.HIGH;
          break;
        case 'URGENT':
          taskData.priority = TaskPriority.URGENT;
          break;
        default:
          taskData.priority = TaskPriority.MEDIUM;
      }
      console.log('Priorité après normalisation:', taskData.priority);
    }
  }

  private handleTaskSaveSuccess(task: Task, message: string): void {
    console.log('Tâche enregistrée avec succès:', task);
    
    // Normaliser les données pour l'affichage correct
    this.normalizeTaskData(task);
    
    // Mise à jour des tâches dans la liste locale
    if (this.isEditingTask) {
      // Mettre à jour la tâche existante
      const index = this.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = task;
      }
    } else {
      // Ajouter la nouvelle tâche
      this.tasks.push(task);
    }
    
    // Forcer la détection de changement en créant un nouveau tableau
    this.tasks = [...this.tasks];
    
    // Nettoyage et feedback
    this.isSavingTask = false;
    this.showTaskForm = false;
    
    // Notification temporaire
    const notification = document.createElement('div');
    notification.className = 'toast-notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
    
    // Supprimer message de chargement
    document.querySelector('.saving-message')?.remove();
  }

  private handleTaskSaveError(error: any, savingMessage: HTMLElement): void {
    console.error('Erreur lors de l\'enregistrement de la tâche', error);
    this.isSavingTask = false;
    
    // Supprimer message de chargement
    savingMessage.remove();
    
    // Notification d'erreur
    const notification = document.createElement('div');
    notification.className = 'toast-notification error';
    notification.textContent = error.error?.message || 'Erreur lors de l\'enregistrement de la tâche';
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}
