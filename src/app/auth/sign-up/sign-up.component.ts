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
  successMessage = '';
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

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.signUpRequest).subscribe({
      next: data => {
        this.isSubmitting = false;
        this.successMessage = 'Registration successful! You can now login.';
        // Reset the form
        this.signUpRequest = {
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          confirmPassword: ''
        };
        // Redirection to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/sign-in']);
        }, 2000);
      },
      error: err => {
        this.isSubmitting = false;
        
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again later.';
        }
      }
    });
  }
}