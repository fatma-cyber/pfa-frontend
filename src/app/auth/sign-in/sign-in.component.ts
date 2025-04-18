import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JwtResponse } from '../../model/jwt-response.model';
import { LoginRequest } from '../../model/login-request.model';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,RouterLink]
})
export class SignInComponent {
  
  isSubmitting = false;
  errorMessage = '';
  loginRequest: LoginRequest = {
    username: '',
    password: '',
    rememberMe: false
  };


  constructor(
    
    private router: Router,
     private authService: AuthService // Uncomment this line to use the AuthService for login
  ) {}
  

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = ''; // Clear previous errors
    
    this.authService.login(this.loginRequest).subscribe({
      next: (response: JwtResponse) => {
        // Handle storage in the component
        this.authService.saveToken(response.token);
        this.authService.saveUser(response);
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        // Handle login error
        this.isSubmitting = false;
        
        // Extract meaningful error message from response
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your connection.';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
        
        console.error('Login failed:', err);
      }
    });
  }
}