import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SignUpRequest } from '../../model/sign-up-request.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SignUpComponent {
  isSubmitting = false;
  errorMessage = '';
  signUpRequest: SignUpRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  };
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  passwordsMatch(): boolean {
    return this.signUpRequest.password === this.signUpRequest.confirmPassword;
  }

  onSubmit() {
    // Basic validation
    if (!this.signUpRequest.username || !this.signUpRequest.email || 
        !this.signUpRequest.password || !this.signUpRequest.firstName || 
        !this.signUpRequest.lastName) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Create a copy of the signUpRequest without the confirmPassword field
    const requestToSend = {
      username: this.signUpRequest.username,
      email: this.signUpRequest.email,
      password: this.signUpRequest.password,
      firstName: this.signUpRequest.firstName,
      lastName: this.signUpRequest.lastName
    };
    
    // Call the register method from AuthService
    this.authService.register(requestToSend).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Show success message or redirect to sign-in page
        this.router.navigate(['/auth/sign-in'], { 
          queryParams: { registered: 'success' } 
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        
        // Extract meaningful error message from response
        if (err.error) {
          // The Spring backend returns error messages directly as strings
          this.errorMessage = typeof err.error === 'string' ? err.error : 'Registration failed. Please check your information.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your connection.';
        } else {
          this.errorMessage = 'Registration failed. Please try again later.';
        }
        
        console.error('Registration failed:', err);
      }
    });
  }
}