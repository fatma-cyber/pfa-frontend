import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignUpRequest } from '../model/sign-up-request.model';
import { LoginRequest } from '../model/login-request.model';
import { JwtResponse } from '../model/jwt-response.model';

const AUTH_API = 'http://localhost:8081/api/auth/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  // Helper method to get basic headers
  private getBasicHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  
  // Helper method to get HTTP headers with auth token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  login(credentials: LoginRequest): Observable<any> {
    const options = { headers: this.getBasicHeaders() };
    return this.http.post(AUTH_API + 'signin', credentials, options);
  }

  register(user: SignUpRequest): Observable<any> {
    const options = { headers: this.getBasicHeaders() };
    return this.http.post(AUTH_API + 'signup', user, options);
  }

  logout(): void {
    window.localStorage.removeItem('auth-token');
    window.localStorage.removeItem('auth-user');
  }

  saveToken(token: string): void {
    window.localStorage.removeItem('auth-token');
    window.localStorage.setItem('auth-token', token);
  }

  getToken(): string {
    return window.localStorage.getItem('auth-token') || '';
  }

  saveUser(user: any): void {
    window.localStorage.removeItem('auth-user');
    window.localStorage.setItem('auth-user', JSON.stringify(user));
  }

  getCurrentUser(): any {
    const userStr = window.localStorage.getItem('auth-user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}