import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Task, TaskStatus } from '../model/Task.model';
import { Comment } from '../model/Comment.model';
import { Kanban } from '../model/kanban.model';

const API_BASE_URL = 'http://localhost:8081/api';
const KANBAN_API_URL = `${API_BASE_URL}/kanbans`;
const TASK_API_URL = `${API_BASE_URL}/tasks`;
const COMMENT_API_URL = `${API_BASE_URL}/comments`;
const DOCUMENT_API_URL = `${API_BASE_URL}/documents`;

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    //let headers = new HttpHeaders();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
  private getAuthHeadersForDocument(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    //let headers = new HttpHeaders();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
  getCurrentUser() {
    return {
      username: localStorage.getItem('auth-username'),
      email: localStorage.getItem('auth-email'),
      id: localStorage.getItem('auth-id'),
    };
  }

  getAllKanbans(): Observable<Kanban[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .get<Kanban[]>(KANBAN_API_URL, options)
      .pipe(catchError(this.handleError<Kanban[]>('getAllKanbans', [])));
  }

  getKanbanById(id: number): Observable<Kanban> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .get<Kanban>(url, options)
      .pipe(catchError(this.handleError<Kanban>(`getKanbanById id=${id}`)));
  }

  createKanban(kanban: Kanban): Observable<Kanban> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<Kanban>(KANBAN_API_URL, kanban, options).pipe(
      tap((newKanban: Kanban) =>
        console.log(`Kanban créé avec id=${newKanban.id}`)
      ),
      catchError(this.handleError<Kanban>('createKanban'))
    );
  }

  updateKanban(id: number, kanban: Kanban): Observable<Kanban> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<Kanban>(url, kanban, options).pipe(
      tap((_) => console.log(`Kanban mis à jour id=${id}`)),
      catchError(this.handleError<Kanban>('updateKanban'))
    );
  }

  deleteKanban(id: number): Observable<any> {
    const url = `${KANBAN_API_URL}/${id}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<any>(url, options).pipe(
      tap((_) => console.log(`Kanban supprimé id=${id}`)),
      catchError(this.handleError<any>('deleteKanban'))
    );
  }

  searchKanbans(name: string): Observable<Kanban[]> {
    const url = `${KANBAN_API_URL}/search`;
    let params = new HttpParams().set('name', name);
    const options = { headers: this.getAuthHeaders(), params: params };
    return this.http
      .get<Kanban[]>(url, options)
      .pipe(catchError(this.handleError<Kanban[]>('searchKanbans', [])));
  }

  getTasksByKanbanId(kanbanId: number): Observable<Task[]> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .get<Task[]>(url, options)
      .pipe(catchError(this.handleError<Task[]>('getTasksByKanbanId', [])));
  }
  getCommentsByTaskId(taskId: number): Observable<Comment[]> {
    const url = `${TASK_API_URL}/task/${taskId}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .get<Comment[]>(url, options)
      .pipe(catchError(this.handleError<Comment[]>('getCommentsByTaskId', [])));
  }

  createTaskAndDocument(
    kanbanId: number,
    taskData: Task,
    files: File[],
    assigneeEmail?: string | null
  ): Observable<Task> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    let params = new HttpParams();

    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params,
    };

    return this.http.post<Task>(url, taskData, options).pipe(
      tap((newTask: Task) => console.log(`Tâche créée avec id=${newTask.id}`)),
      switchMap((newTask: Task): Observable<Task> => {
        if (files.length > 0) {
          return this.createDocument(newTask.id, files, assigneeEmail).pipe(
            tap(() =>
              console.log(`Documents uploadés pour la tâche ${newTask.id}`)
            ),
            map(() => newTask) // on retourne la tâche après upload
          );
        } else {
          return of(newTask); // on retourne directement la tâche s’il n’y a pas de fichiers
        }
      }),
      catchError(this.handleError<Task>('createTaskAndDocument'))
    );
  }
  updateTask(
    taskId: number,
    taskData: Task,
    files: File[],
    assigneeEmail?: string | null
  ): Observable<Task> {
    const url = `${TASK_API_URL}/${taskId}`;
    let params = new HttpParams();
    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params,
    };
   
    return this.http.put<Task>(url, taskData, options).pipe(
      tap(() => console.log(`Tâche mise à jour id=${taskId}`)),
      switchMap((updatedTask: Task) => {
        if (files.length > 0) {
          console.log("y a un file")
          return this.createDocument(taskId, files, assigneeEmail).pipe(
            tap(() =>
              console.log(`Documents uploadés pour la tâche ${taskId}`)
            ),
            map(() => updatedTask)
          );
        } else {
          return of(updatedTask);
        }
      }),
      catchError(this.handleError<Task>('updateTask'))
    );
    /*   return this.http.put<Task>(url, taskData, options).pipe(
      tap((_) => console.log(`Tâche mise à jour id=${taskId}`)),
      catchError(this.handleError<Task>('updateTask'))
    ); */
  }

  createDocument(
    taskId: number | undefined,
    files: File[],
    assigneeEmail?: string | null
  ): Observable<Document[]> {
    const url = `${DOCUMENT_API_URL}/${taskId}`;
    const formData = new FormData();
    console.log("files from createDocument",files)
    files.forEach((file) => {
      
      formData.append('files', file, file.name); // 'files' correspond au nom attendu côté Spring
    });

    let params = new HttpParams();
    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeadersForDocument(),
      params: params,
    };
    console.log('**********files:::::::::::::::::', files);
    return this.http.post<Document[]>(url, formData, options).pipe(
      tap((newDocuments: Document[]) =>
        console.log(`Documents créés :`, newDocuments)
      ),
      catchError(this.handleError<Document[]>('createDocument'))
    );
  }

  openDocument(documentId: number): void {
    const url = `${DOCUMENT_API_URL}/${documentId}/open`;
    const options = {
      headers: this.getAuthHeadersForDocument(),
    };

    // Création d'un lien avec token dans les headers via URL.createObjectURL n'est pas possible,
    // donc si ton backend vérifie l'auth via headers, il faut passer par une requête et ouvrir avec un blob :
    this.http
      .get(url, { ...options, responseType: 'blob' })
      .subscribe((blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      });
  }
  downloadDocument(documentId: number): Observable<Blob> {
    const url = `${DOCUMENT_API_URL}/${documentId}/download`;
    const options = {
      headers: this.getAuthHeadersForDocument(),
      responseType: 'blob' as 'json',
    };
    return this.http.get<Blob>(url, options);
  }

  /*   createTask(
    kanbanId: number,
    taskData: Task,
    assigneeEmail?: string | null
  ): Observable<Task> {
    const url = `${TASK_API_URL}/kanban/${kanbanId}`;
    let params = new HttpParams();
    //let taskSaved: Observable<Task>;

    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params,
    };

    console.log(`POST ${url} with params: ${params.toString()}`);
    console.log('Body:', JSON.stringify(taskData));
    console.log('headers*******:', this.getAuthHeaders());

   
    return this.http.post<Task>(url, taskData, options).pipe(
      tap((newTask: Task) => console.log(`Tâche créée avec id=${newTask.id}`)),
      catchError(this.handleError<Task>('createTask'))
    );
  } */

  createComment(
    taskId: number,
    commentData: Comment,
    assigneeEmail?: string | null
  ): Observable<Comment> {
    const url = `${COMMENT_API_URL}/task/${taskId}`;
    let params = new HttpParams();
    if (assigneeEmail !== undefined && assigneeEmail !== null) {
      params = params.set('assigneeEmail', assigneeEmail);
    }
    const options = {
      headers: this.getAuthHeaders(),
      params: params,
    };

    console.log(`POST ${url} with params: ${params.toString()}`);
    console.log('Body:', JSON.stringify(commentData));

    return this.http.post<Comment>(url, commentData, options).pipe(
      tap((newComment: Comment) => console.log(`Comment créée`)),
      catchError(this.handleError<Comment>('createTask'))
    );
  }

  deleteTask(taskId: number): Observable<any> {
    const url = `${TASK_API_URL}/${taskId}`;
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<any>(url, options).pipe(
      tap((_) => console.log(`Tâche supprimée id=${taskId}`)),
      catchError(this.handleError<any>('deleteTask'))
    );
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    const url = `${TASK_API_URL}/${taskId}/status`;
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .patch<Task>(url, { status: status.toString() }, options)
      .pipe(
        tap((_) => console.log(`Statut tâche mis à jour id=${taskId}`)),
        catchError(this.handleError<Task>('updateTaskStatus'))
      );
  }

  /**
   * Récupère tous les projets où l'utilisateur est impliqué (créateur ou assigné)
   */
  getProjectsWhereInvolved(): Observable<Kanban[]> {
    const url = `${KANBAN_API_URL}/involved`;
    const options = { headers: this.getAuthHeaders() };
    return this.http
      .get<Kanban[]>(url, options)
      .pipe(
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
            `body was: ${JSON.stringify(error.error)}`
        );
      }
      return throwError(() => error);
    };
  }
}
