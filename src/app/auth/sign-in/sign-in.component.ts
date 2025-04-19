import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';  // Chemin absolu (plus fiable)
import { JwtResponse } from '../../model/jwt-response.model';
import { LoginRequest } from '../../model/login-request.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
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
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginRequest).subscribe({
      next: (response: JwtResponse) => {
        console.log('Login successful:', response);
        this.authService.saveToken(response.token);
        this.authService.saveUser(response);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.isSubmitting = false;
        console.error('Login error:', err);
        
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe invalide.';
        } else {
          this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        }
      }
    });
  }
}