import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material/material.module';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';
import { AuctionRequest } from '../../../shared/models/auction-request.model';
import { ItemService } from '../../../core/services/item.service';
import { ItemResponse } from '../../../shared/models/item-response.model';

@Component({
  selector: 'app-crear-subasta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MaterialModule
  ],
  templateUrl: './crear-subasta.component.html',
  styleUrls: ['./crear-subasta.component.css']
})
export class CrearSubastaComponent implements OnInit {
  ofertaForm!: FormGroup;
  isEditMode: boolean = false;
  items: ItemResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private itemService: ItemService,
    private auctionService: AuctionService // Servicio de AuctionService

  ) { }

  ngOnInit() {
    this.initForm();
    this.loaditems();
    this.isEditMode = false;
  }

  private initForm(): void {
    this.ofertaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      start_date: ['',Validators.required],
      end_date: ['',Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      item_id: ['',Validators.required]
    });
  }

  private loaditems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        console.log(items);
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.showSnackBar('Error al cargar los items');
      }
    });
  }
  onSubmit(): void {
    if (this.ofertaForm.valid) {
      const formValues = this.ofertaForm.value;
  
      // Asegúrate de que las fechas sean válidas
      if (this.isValidDate(formValues.start_date) && this.isValidDate(formValues.end_date)) {
        formValues.start_date = this.formatDateTime(formValues.start_date);
        formValues.end_date = this.formatDateTime(formValues.end_date);
  
        const auctionData: AuctionRequest = formValues;
        console.log(auctionData);
        this.auctionService.createAuction(auctionData).subscribe({
          next: () => {
            this.showSnackBar('Subasta creada exitosamente');
            this.router.navigate(['/home/catalog']);
          },
          error: (err) => {
            console.error(err);
            this.showSnackBar('Error al crear la subasta');
          }
        });
      } else {
        this.showSnackBar('Las fechas no son válidas.');
      }
    } else {
      this.showSnackBar('Por favor, complete todos los campos requeridos.');
    }
  }
  
  private isValidDate(date: any): boolean {
    return !isNaN(new Date(date).getTime());
  }
  

  vistaPrevia(): void {
    console.log('Vista previa', this.ofertaForm.value);
  }

  salir(): void {
    this.router.navigate(['']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  private convertToISO(date: any): string {
    if (date) {
      const isoDate = new Date(date).toISOString();
      return isoDate;
    }
    return '';
  }


  private formatDateTime(date: Date): string {
    if (date) {
      return new Date(date).toISOString();  // Devuelve la fecha en el formato deseado
    }
    return '';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].slice(0, 5);
  }
  
  
}