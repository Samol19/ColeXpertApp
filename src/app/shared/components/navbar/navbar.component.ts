import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../models/auth-response.model';
import { StorageService } from '../../../core/services/storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
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
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private storageService = inject(StorageService);

  isAuthenticated = false;
  img = '';
  notificationCount = 0;
  notifications: { id: number; message: string; time: string; read: boolean }[] = [];

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadUserProfile();
    this.loadNotifications();
  }

  checkAuthentication(): void {
    const storedUser = this.storageService.getAuthData();
    this.isAuthenticated = !!storedUser;
    if (storedUser) {
      this.img = storedUser.user_img?.startsWith('data:image') 
        ? storedUser.user_img 
        : `data:image/png;base64,${storedUser.user_img}`;
    }
  }

  loadUserProfile(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.isAuthenticated = true;
          this.img = user.user_img?.startsWith('data:image') 
            ? user.user_img 
            : `data:image/png;base64,${user.user_img}`;
        }
      },
      error: (err) => console.error('Error loading user profile', err)
    });
  }

  loadNotifications(): void {
    // Implement notification loading logic here
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }

  openCrearSubasta(): void {
    this.router.navigate(['home/create']);
  }

  openCrearItem(): void {
    this.router.navigate(['home/create-item']);
  }

  markAllAsRead(): void {
    // Implement mark all as read logic here
  }
}
