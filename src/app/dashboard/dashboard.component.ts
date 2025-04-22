import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../core/layout/layout.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent]
})
export class DashboardComponent implements OnInit {
  user: any = {};
  projects = [
    { name: 'Website Redesign', progress: 75, tasks: 24, completed: 18 },
    { name: 'Mobile App Development', progress: 45, tasks: 36, completed: 16 },
    { name: 'Marketing Campaign', progress: 90, tasks: 12, completed: 11 },
    { name: 'Database Migration', progress: 30, tasks: 18, completed: 5 }
  ];

  recentTasks = [
    { title: 'Design Homepage', status: 'In Progress', due: '2025-04-12', priority: 'High' },
    { title: 'Create User Authentication', status: 'Completed', due: '2025-04-05', priority: 'Medium' },
    { title: 'Database Schema Design', status: 'Review', due: '2025-04-15', priority: 'High' },
    { title: 'API Documentation', status: 'Todo', due: '2025-04-20', priority: 'Low' }
  ];

  constructor(private authService: AuthService) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.user.avatar = this.user.avatar || 'https://i.pravatar.cc/150?img=12';
    }
  }

  ngOnInit() {
    console.log("Token stocké:", localStorage.getItem('auth-token'));
    console.log("Utilisateur connecté:", this.authService.getCurrentUser());
  }
}