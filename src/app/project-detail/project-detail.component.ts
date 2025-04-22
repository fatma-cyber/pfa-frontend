import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { KanbanService, Kanban } from '../services/kanban.service';

import { LayoutComponent } from '../core/layout/layout.component';
import { Task, TaskPriority, TaskStatus } from '../model/Task.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectId!: number;
  project: Kanban | null = null;
  tasks: Task[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Pour utilisation dans le template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private route: ActivatedRoute,
    private kanbanService: KanbanService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = +id;
        this.loadProject();
        this.loadTasks();
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
      error: (err) => {
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
      error: (err) => {
        this.error = 'Erreur lors du chargement des tâches';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

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
}
