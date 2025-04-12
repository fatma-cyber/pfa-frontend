import { Routes } from '@angular/router';

import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth/sign-in', pathMatch: 'full' },
  { 
    path: 'auth', 
    children: [
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent }
    ] 
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/auth/sign-in' }
];
