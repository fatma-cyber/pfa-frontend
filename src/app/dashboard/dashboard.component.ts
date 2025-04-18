import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent {
  isSidebarCollapsed = false;
  user = {
    username: 'John Doe',
    email: 'Project Manager',
    avatar: 'https://i.pravatar.cc/150?img=12'
  };

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

  constructor(private router: Router) {

    this.user = JSON.parse(window.localStorage.getItem('auth-user') || '{}');
    this.user.avatar = this.user.avatar || 'https://i.pravatar.cc/150?img=12'; // Default avatar if not set
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    // Here you would call your auth service to log out
    this.router.navigate(['/auth/sign-in']);
  }
}