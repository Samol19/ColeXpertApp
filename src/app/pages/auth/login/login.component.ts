import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { AuthRequest } from '../../../shared/models/auth-request.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRippleModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm:FormGroup;
  hidePassword = true;
  isLoading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  private readonly ADMIN_ROLE = 'ADMIN';
  private readonly USER_ROLE = 'USER';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  controlHasError(control:string, error:string) {
    return this.loginForm.controls[control].hasError(error);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if(this.loginForm.invalid) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    const credentials: AuthRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.redirectUser();
        this.showSnackBar('Inicio de sesion exitoso');
        
      },
      error: () => {
        this.showSnackBar('Error en el inicio de sesion. Por favor, intenta de nuevo');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private redirectUser():void {
    const userRole = this.authService.getUserRole();
    
    if (userRole === this.ADMIN_ROLE || userRole === this.USER_ROLE) {
      this.router.navigate(["/home/catalog"]);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  openRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 30000,
      verticalPosition: 'top'
    });
  }

}
