import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8081/api/kanbans';

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

  getAllKanbans(): Observable<Kanban[]> {
    return this.http.get<Kanban[]>(API_URL);
  }

  getKanbanById(id: number): Observable<Kanban> {
    return this.http.get<Kanban>(`${API_URL}/${id}`);
  }

  createKanban(kanban: Kanban): Observable<Kanban> {
    return this.http.post<Kanban>(API_URL, kanban);
  }

  updateKanban(id: number, kanban: Kanban): Observable<Kanban> {
    return this.http.put<Kanban>(`${API_URL}/${id}`, kanban);
  }

  deleteKanban(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  searchKanbans(name: string): Observable<Kanban[]> {
    return this.http.get<Kanban[]>(`${API_URL}/search?name=${name}`);
  }
}