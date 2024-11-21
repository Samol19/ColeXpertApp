import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuctionCardComponent } from '../../../shared/components/auction-card/auction-card.component';
import { AuctionResponse } from '../../../shared/models/auction-response.model';
import { BidResponse } from '../../../shared/models/bid-response.model';
import { BidsService } from '../../../core/services/bids.service';
import { AuctionService } from '../../../core/services/auction.service';
import { StorageService } from '../../../core/services/storage.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { catchError, finalize, of } from 'rxjs';
import { CustomPaymentRequest } from '../../../shared/models/payment-request.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-bids-history',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    AuctionCardComponent,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './bids-history.component.html',
  styleUrls: ['./bids-history.component.css']
})
export class BidsHistoryComponent implements OnInit {
  auctions: AuctionResponse[] = [];
  bids: BidResponse[] = [];
  payments: CustomPaymentRequest[] = [];
  isLoading = true;
  error: string | null = null;
  expandedAuctions = new Set<string>();
  currentUser: any;

  constructor(
    private bidService: BidsService,
    private auctionService: AuctionService,
    private storageService: StorageService,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.storageService.getAuthData();
    if (this.currentUser) {
      this.loadBidsAndAuctions();
      this.loadPayments();
    } else {
      this.error = 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.';
      this.isLoading = false;
    }
  }

  loadBidsAndAuctions() {
    this.isLoading = true;
    this.bidService.getAllBids().pipe(
      catchError(err => {
        console.error('Error loading bids:', err);
        this.error = 'Error al cargar las pujas';
        return of([]);
      })
    ).subscribe(bids => {
      this.bids = bids.filter(bid => bid.user_name === this.currentUser?.user_name);
      this.loadAuctions();
    });
  }

  loadAuctions() {
    this.auctionService.getAllAuctions().pipe(
      catchError(err => {
        console.error('Error loading auctions:', err);
        this.error = 'Error al cargar las subastas';
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(auctions => {
      const auctionNames = new Set(this.bids.map(bid => bid.auction_name));
      this.auctions = auctions.filter(auction => auctionNames.has(auction.name));
    });
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe({
      next: (payments) => {
        this.payments = payments.filter(payment => payment.user_id === this.currentUser?.id);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
      }
    });
  }


  openPaymentDialog(auction: AuctionResponse) {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: { auction: auction, amount: this.getHighestBid(auction.name) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processPayment(auction, result);
      }
    });
  }
  

  getHighestBid(auctionName: string): number {
    const auctionBids = this.bids.filter(bid => bid.auction_name === auctionName);
    return Math.max(...auctionBids.map(bid => bid.amount));
  }

  getBidsForAuction(auctionName: string): BidResponse[] {
    return this.bids.filter(bid => bid.auction_name === auctionName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  toggleBids(auctionName: string) {
    if (this.expandedAuctions.has(auctionName)) {
      this.expandedAuctions.delete(auctionName);
    } else {
      this.expandedAuctions.add(auctionName);
    }
  }

  isAuctionWinner(auction: AuctionResponse): boolean {
    const auctionBids = this.bids.filter(bid => bid.auction_name === auction.name);
    const highestBid = Math.max(...auctionBids.map(bid => bid.amount));
    const winningBid = auctionBids.find(bid => bid.amount === highestBid);
    return winningBid?.user_name === this.currentUser?.user_name && this.isAuctionEnded(auction);
  }

  isAuctionEnded(auction: AuctionResponse): boolean {
    return new Date(auction.end_date) < new Date();
  }

  hasPaymentForAuction(auction: AuctionResponse): boolean {
    return this.payments.some(payment => payment.item_id === auction.item.id);
  }

  processPayment(auction: AuctionResponse, cardDetails: any) {
    console.log('Processing payment for auction:', auction);
    console.log('Card details:', cardDetails);

        console.log('Sending payment request:');
        
            console.log('Payment created successfully:');
            this.payments.push();
            this.snackBar.open('Pago realizado con éxito', 'Cerrar', { duration: 3000 });
       
    
  }
  

  deleteBid(bid: BidResponse) {
    this.bidService.deleteBid(bid.id).subscribe({
      next: () => {
        this.bids = this.bids.filter(b => b.id !== bid.id);
        this.snackBar.open('Puja eliminada con éxito', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting bid:', err);
        this.snackBar.open('Error al eliminar la puja', 'Cerrar', { duration: 3000 });
      }
    });
  }
}