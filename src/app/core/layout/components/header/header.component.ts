import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  user: any = {};
  
  constructor(private router: Router, private authService: AuthService) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
    }
  }
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/sign-in']);
  }
}
