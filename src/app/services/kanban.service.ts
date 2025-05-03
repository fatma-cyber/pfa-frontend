import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task, TaskStatus } from '../model/Task.model';
import { Kanban } from '../model/kanban.model';


const API_BASE_URL = 'http://localhost:8081/api';
const KANBAN_API_URL = `${API_BASE_URL}/kanbans`;
const TASK_API_URL = `${API_BASE_URL}/tasks`;

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllKanbans(): Observable<Kanban[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban[]>(KANBAN_API_URL, options).pipe(
      catchError(this.handleError<Kanban[]>('getAllKanbans', []))
    );
  }

  getKanbanById(id: number): Observable<Kanban> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban>(url, options).pipe(
      catchError(this.handleError<Kanban>(`getKanbanById id=${id}`))
    );
  }

  createKanban(kanban: Kanban): Observable<Kanban> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<Kanban>(KANBAN_API_URL, kanban, options).pipe(
      tap((newKanban: Kanban) => console.log(`Kanban créé avec id=${newKanban.id}`)),
      catchError(this.handleError<Kanban>('createKanban'))
    );
  }

  updateKanban(id: number, kanban: Kanban): Observable<Kanban> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<Kanban>(url, kanban, options).pipe(
      tap(_ => console.log(`Kanban mis à jour id=${id}`)),
      catchError(this.handleError<Kanban>('updateKanban'))
    );
  }

  deleteKanban(id: number): Observable<any> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<any>(url, options).pipe(
      tap(_ => console.log(`Kanban supprimé id=${id}`)),
      catchError(this.handleError<any>('deleteKanban'))
    );
  }

  searchKanbans(name: string): Observable<Kanban[]> {
    const url = `${KANBAN_API_URL}/search`;
    let params = new HttpParams().set('name', name);
    const options = { headers: this.getAuthHeaders(), params: params };
    return this.http.get<Kanban[]>(url, options).pipe(
      catchError(this.handleError<Kanban[]>('searchKanbans', []))
    );
  }

  getTasksByKanbanId(kanbanId: number): Observable<Task[]> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Task[]>(url, options).pipe(
      catchError(this.handleError<Task[]>('getTasksByKanbanId', []))
    );
  }

  createTask(kanbanId: number, taskData: Task, assigneeEmail?: string | null): Observable<Task> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    let params = new HttpParams();
    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params
    };

    console.log(`POST ${url} with params: ${params.toString()}`);
    console.log('Body:', JSON.stringify(taskData));

    return this.http.post<Task>(url, taskData, options).pipe(
      tap((newTask: Task) => console.log(`Tâche créée avec id=${newTask.id}`)),
      catchError(this.handleError<Task>('createTask'))
    );
  }

  updateTask(taskId: number, taskData: Task, assigneeEmail?: string | null): Observable<Task> {
    const url = `${TASK_API_URL}/${taskId}`;
    let params = new HttpParams();
    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params
    };

    console.log(`PUT ${url} with params: ${params.toString()}`);
    console.log('Body:', JSON.stringify(taskData));

    return this.http.put<Task>(url, taskData, options).pipe(
      tap(_ => console.log(`Tâche mise à jour id=${taskId}`)),
      catchError(this.handleError<Task>('updateTask'))
    );
  }

  deleteTask(taskId: number): Observable<any> {
    const url = `${TASK_API_URL}/${taskId}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<any>(url, options).pipe(
      tap(_ => console.log(`Tâche supprimée id=${taskId}`)),
      catchError(this.handleError<any>('deleteTask'))
    );
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    const url = `${TASK_API_URL}/${taskId}/status`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.patch<Task>(url, { status: status.toString() }, options).pipe(
      tap(_ => console.log(`Statut tâche mis à jour id=${taskId}`)),
      catchError(this.handleError<Task>('updateTaskStatus'))
    );
  }

  /**
   * Récupère tous les projets où l'utilisateur est impliqué (créateur ou assigné)
   */
  getProjectsWhereInvolved(): Observable<Kanban[]> {
    const url = `${KANBAN_API_URL}/involved`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<Kanban[]>(url, options).pipe(
      catchError(this.handleError<Kanban[]>('getProjectsWhereInvolved', []))
    );
  }

  /**
   * Récupère tous les projets où l'utilisateur est impliqué pour l'affichage unifié
   */
  getAllProjectsForUser(): Observable<Kanban[]> {
    return this.getProjectsWhereInvolved();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} a échoué: ${error.message}`);
      if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`);
      }
      return throwError(() => error);
    };
  }
}