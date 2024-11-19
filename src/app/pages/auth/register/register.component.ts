import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../shared/models/register-request.model';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  registerForm: FormGroup;
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;
  isLoading = false;
  hidePassword = true;
  img_text: string = 'None';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  
  ngOnInit() {}

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      adress: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      img: ['']
    });
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.registerForm.controls[controlName].hasError(errorName);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.profileImagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      if (this.profileImagePreview) {
        this.img_text = this.profileImagePreview;
      }
      const userData : RegisterRequest = {
        ...this.registerForm.value,
        phone: this.registerForm.value.phone.toString(),
        img: this.img_text
      };
      this.registerUser(userData);
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }

  private registerUser(userData: RegisterRequest) {
    this.authService.register(userData).subscribe({
      next: () => {
        this.showSnackBar("Usuario registrado correctamente");
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.showSnackBar(error.error.message || "Error al registrar usuario");
        this.isLoading = false; 
      },
      complete: () => this.isLoading = false
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

}
