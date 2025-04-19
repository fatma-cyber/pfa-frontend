import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KanbanService, Kanban } from '../services/kanban.service';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, RouterLink],
  providers: [DatePipe]
})
export class ProjectsComponent implements OnInit {
  projects: Kanban[] = [];
  projectForm: FormGroup;
  isLoading = false;
  showForm = false;
  currentProject: Kanban | null = null;
  isEditMode = false;
  searchTerm = '';
  
  constructor(
    private kanbanService: KanbanService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, {
      validators: [this.dateRangeValidator]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.kanbanService.getAllKanbans().subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets', err);
        this.isLoading = false;
      }
    });
  }

  openProjectForm() {
    this.projectForm.reset();
    this.isEditMode = false;
    this.currentProject = null;
    this.showForm = true;
  }

  closeProjectForm() {
    this.showForm = false;
  }

  saveProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const projectData: Kanban = {
      name: this.projectForm.value.name,
      description: this.projectForm.value.description,
      startDate: this.projectForm.value.startDate,
      endDate: this.projectForm.value.endDate
    };

    if (this.isEditMode && this.currentProject?.id) {
      this.kanbanService.updateKanban(this.currentProject.id, projectData).subscribe({
        next: (updated) => {
          const index = this.projects.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            this.projects[index] = updated;
          }
          this.isLoading = false;
          this.showForm = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du projet', err);
          this.isLoading = false;
        }
      });
    } else {
      this.kanbanService.createKanban(projectData).subscribe({
        next: (created) => {
          this.projects.push(created);
          this.isLoading = false;
          this.showForm = false;
        },
        error: (err) => {
          console.error('Erreur lors de la création du projet', err);
          this.isLoading = false;
        }
      });
    }
  }

  editProject(project: Kanban) {
    this.isEditMode = true;
    this.currentProject = project;
    
    // Format dates for the form
    const startDate = project.startDate ? this.datePipe.transform(new Date(project.startDate), 'yyyy-MM-dd') : '';
    const endDate = project.endDate ? this.datePipe.transform(new Date(project.endDate), 'yyyy-MM-dd') : '';
    
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      startDate: startDate,
      endDate: endDate
    });
    
    this.showForm = true;
  }

  deleteProject(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
      this.isLoading = true;
      this.kanbanService.deleteKanban(id).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== id);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du projet', err);
          this.isLoading = false;
        }
      });
    }
  }

  searchProjects() {
    if (this.searchTerm.trim() === '') {
      this.loadProjects();
      return;
    }
    
    this.isLoading = true;
    this.kanbanService.searchKanbans(this.searchTerm).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la recherche de projets', err);
        this.isLoading = false;
      }
    });
  }

  dateRangeValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    
    if (start && end && new Date(start) > new Date(end)) {
      return { dateRange: true };
    }
    return null;
  }
}