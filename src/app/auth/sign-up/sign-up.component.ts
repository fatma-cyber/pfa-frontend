import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignUpComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Here you would call your auth service to register
    // For now, we'll just simulate and navigate to sign in
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/auth/sign-in']);
    }, 1000);
  }
}