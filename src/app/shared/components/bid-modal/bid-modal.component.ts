import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BidRequest } from '../../models/bid-request.model';
import { BidsService } from '../../../core/services/bids.service';

interface BidModalData {
  auctionName: string;
  currentBid: number;
  userLastBid: number | null;
}

@Component({
  selector: 'app-bid-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './bid-modal.component.html',
  styleUrl: './bid-modal.component.css'
})
export class BidModalComponent {
  bidAmount: number;
  minBidAmount: number;

  constructor(
    public dialogRef: MatDialogRef<BidModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BidModalData
  ) {
    // Set minimum bid amount to current bid + 1
    this.minBidAmount = this.data.currentBid + 1;
    this.bidAmount = this.minBidAmount;
  }

  validateBidAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    
    if (value < this.minBidAmount) {
      this.bidAmount = this.minBidAmount;
    }
  }

  isValidBid(): boolean {
    return this.bidAmount >= this.minBidAmount;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isValidBid()) {
      // Return only the amount, let parent component handle the bid creation
      this.dialogRef.close({ amount: this.bidAmount });
    }
  }
}