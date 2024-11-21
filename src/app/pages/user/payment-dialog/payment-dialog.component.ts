import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaymentService } from '../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css'
})
export class PaymentDialogComponent {
  cardNumber: string = '';
  expirationDate: string = '';
  cvv: string = '';

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { auction: any, amount: number }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    if (this.isFormValid()) {
      this.dialogRef.close({
        cardNumber: this.cardNumber,
        expirationDate: this.expirationDate,
        cvv: this.cvv
      });
    }
  }

  isFormValid(): boolean {
    return this.cardNumber.length === 16 && 
           this.expirationDate.length === 5 && 
           this.cvv.length === 3;
  }
}