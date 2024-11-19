import { MaterialModule } from '../../../material/material.module';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption, MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemService } from '../../../core/services/item.service';
import { StorageService } from '../../../core/services/storage.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/category-response.model';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-crear-subasta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './crear-subasta.component.html',
  styleUrls: ['./crear-subasta.component.css']
})
export class CrearItemComponent implements OnInit {
  itemForm!: FormGroup;
  categories: Category[] = [];
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private itemService: ItemService,
    private storageService: StorageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      img: [''],
      init_price: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      user_id: ['', Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showSnackBar('Error al cargar las categorías');
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const userId = this.storageService.getAuthData()?.user_id;
      if (userId) {
        this.itemForm.patchValue({ user_id: userId });
      }

      this.itemService.createItem(this.itemForm.value).subscribe({
        next: (response) => {
          this.showSnackBar('Ítem creado exitosamente');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error(err);
          this.showSnackBar('Error al crear el ítem');
        }
      });
    } else {
      this.showSnackBar('Por favor, complete todos los campos requeridos.');
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.itemForm.patchValue({
          img: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  vistaPrevia(): void {
    console.log('Vista previa', this.itemForm.value);
  }

  salir(): void {
    this.router.navigate(['/home']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}