import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignInComponent {
  signinForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.signinForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Here you would call your auth service to authenticate
    // For now, we'll just simulate and navigate to dashboard
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}