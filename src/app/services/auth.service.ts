import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


import { LoginRequest } from '../model/login-request.model';
import { SignUpRequest } from '../model/sign-up-request.model';
import { JwtResponse } from '../model/jwt-response.model';

const AUTH_API = 'http://localhost:8081/api/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  /**
   * Method to authenticate user - calls Spring Boot authenticateUser endpoint
   * Returns raw response for component to handle storage
   * @param loginRequest Login credentials
   * @returns Observable with JWT response
   */
  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      AUTH_API + 'signin',
      loginRequest,
      httpOptions
    );
  }

  /**
   * Method to register user - calls Spring Boot registerUser endpoint
   * @param signUpRequest User registration data
   * @returns Observable with registration response
   */
  register(signUpRequest: SignUpRequest): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      signUpRequest,
      httpOptions
    );
  }
  
  /**
   * Saves authentication token to local storage
   * @param token JWT token
   */
  saveToken(token: string): void {
    window.localStorage.removeItem('auth-token');
    window.localStorage.setItem('auth-token', token);
  }
  
  /**
   * Saves user details to local storage
   * @param user User details
   */
  saveUser(user: any): void {
    window.localStorage.removeItem('auth-user');
    window.localStorage.setItem('auth-user', JSON.stringify(user));
  }
  
  /**
   * Retrieves token from local storage
   * @returns JWT token string or empty string
   */
  getToken(): string {
    return localStorage.getItem('auth-token') || '';
  }
  
  /**
   * Retrieves current user from local storage
   * @returns User object or null
   */
  getCurrentUser(): any {
    const user = window.localStorage.getItem('auth-user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
  
  /**
   * Logs out user by removing stored tokens
   */
  logout(): void {
    window.localStorage.removeItem('auth-token');
    window.localStorage.removeItem('auth-user');
  }
  
  /**
   * Checks if user is logged in
   * @returns boolean indicating if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}