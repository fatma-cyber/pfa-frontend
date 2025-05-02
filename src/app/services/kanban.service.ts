import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task } from '../model/Task.model';

const API_URL = 'http://localhost:8081/api/kanbans';
const TASK_API_URL = 'http://localhost:8081/api/tasks';

export interface Kanban {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  creatorUsername?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  constructor(private http: HttpClient) { }

  // Helper method to get HTTP headers with auth token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllKanbans(): Observable<Kanban[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban[]>(API_URL, options);
  }

  getKanbanById(id: number): Observable<Kanban> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban>(`${API_URL}/${id}`, options);
  }

  createKanban(kanban: Kanban): Observable<Kanban> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<Kanban>(API_URL, kanban, options);
  }

  updateKanban(id: number, kanban: Kanban): Observable<Kanban> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<Kanban>(`${API_URL}/${id}`, kanban, options);
  }

  deleteKanban(id: number): Observable<any> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete(`${API_URL}/${id}`, options);
  }

  searchKanbans(name: string): Observable<Kanban[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban[]>(`${API_URL}/search?name=${name}`, options);
  }

  getTasksByKanbanId(kanbanId: number): Observable<Task[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Task[]>(`${API_URL}/${kanbanId}/tasks`, options);
  }

  createTask(kanbanId: number, taskData: any): Observable<Task> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    const options = { headers: this.getAuthHeaders() };
    
    console.log(`Envoi de tâche au backend: ${url}`);
    console.log('Données:', JSON.stringify(taskData));
    
    // Vérifier le token pour le debug
    const token = localStorage.getItem('auth-token');
    console.log('Token présent:', !!token);
    
    return this.http.post<Task>(url, taskData, options).pipe(
      tap(response => console.log('Réponse du backend:', response)),
      catchError(error => {
        console.error('Erreur lors de la création de tâche:', error);
        if (error.error) {
          console.error('Message d\'erreur:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  updateTask(taskId: number, taskData: any): Observable<Task> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<Task>(`${TASK_API_URL}/${taskId}`, taskData, options)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la mise à jour de la tâche', error);
          return throwError(() => error);
        })
      );
  }
}