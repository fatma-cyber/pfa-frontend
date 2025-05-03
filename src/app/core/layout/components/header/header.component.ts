import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
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
  isUserMenuOpen = false;
  
  constructor(private router: Router, private authService: AuthService) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
    }
  }
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
  
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/sign-in']);
  }
  
  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userProfile = document.querySelector('.user-profile');
    
    if (userProfile && !userProfile.contains(target)) {
      this.isUserMenuOpen = false;
    }
  }
}
