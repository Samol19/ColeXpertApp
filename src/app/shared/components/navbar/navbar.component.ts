import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject, HostListener } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../models/auth-response.model';
import { StorageService } from '../../../core/services/storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);

  isAuthenticated = false;
  img = '';
  notificationCount = 0;
  notifications: Notification[] = [];
  isMenuOpen = false;
  isMobile = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadUserProfile();
    this.loadNotifications();
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMenuOpen = false;
    }
    this.cdr.detectChanges();
  }

  checkAuthentication(): void {
    const storedUser = this.storageService.getAuthData();
    this.isAuthenticated = !!storedUser;
    if (storedUser) {
      this.img = storedUser.user_img?.startsWith('data:image') 
        ? storedUser.user_img 
        : `data:image/png;base64,${storedUser.user_img}`;
    }
    this.cdr.detectChanges();
  }

  loadUserProfile(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.isAuthenticated = true;
          this.img = user.user_img?.startsWith('data:image') 
            ? user.user_img 
            : `data:image/png;base64,${user.user_img}`;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading user profile', err)
    });
  }

  loadNotifications(): void {

    this.notifications = [
      { id: 1, message: 'New bid on your item', time: '2 minutes ago', read: false },
      { id: 2, message: 'Auction ending soon', time: '1 hour ago', read: true },
    ];
    this.notificationCount = this.notifications.filter(n => !n.read).length;
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
    this.closeMenu();
  }

  openCrearSubasta(): void {
    this.router.navigate(['home/create']);
    this.closeMenu();
  }

  openCrearItem(): void {
    this.router.navigate(['home/create-item']);
    this.closeMenu();
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notificationCount = 0;
    this.cdr.detectChanges();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.cdr.detectChanges();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMenu();
  }
}