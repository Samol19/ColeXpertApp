import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuctionResponse } from '../../models/auction-response.model';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import { BidModalComponent } from '../bid-modal/bid-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { BidResponse } from '../../models/bid-response.model';
import { BidsService } from '../../../core/services/bids.service';
import { StorageService } from '../../../core/services/storage.service';
import { BidRequest } from '../../models/bid-request.model';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './auction-detail.component.html',
  styleUrl: './auction-detail.component.css'
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  @Input() auctionId!: number;
  
  auction: AuctionResponse | null = null;
  bids: BidResponse[] = [];
  highestBid: number = 0;
  userLastBid: number | null = null;

  isLoading = true;
  error: string | null = null;
  timeRemaining = '';
  isFavorite = false;
  private timerSubscription?: Subscription;
  isHammering: boolean = false; // Added property
  currentUser: any;

  constructor(
    private auctionService: AuctionService,
    private authService: AuthService,
    private bidsService: BidsService,
    private snackBar: MatSnackBar,
    private location: Location,
    private dialog: MatDialog,
    private router: Router, // Added Router
    private storageService: StorageService

  ) {}

  ngOnInit(): void {
    this.currentUser = this.storageService.getAuthData();
    this.loadAuctionDetails();
    this.timerSubscription = interval(1000).subscribe(() => this.updateTimeRemaining());
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadAuctionDetails(): void {
    this.isLoading = true;
    this.error = null;
    this.auctionService.getAuctionById(this.auctionId).subscribe({
      next: (data) => {
        this.auction = data;
        this.isLoading = false;
        this.updateTimeRemaining();
        this.loadBids();
      },
      error: (err) => {
        console.error('Error loading auction details:', err);
        this.error = 'Error al cargar detalles de la subasta';
        this.isLoading = false;
        this.showSnackBar('Error al cargar detalles de la subasta');
      }
    });
  }

  loadBids(): void {
    if (!this.auction) return;
    
    this.bidsService.getAllBids().subscribe({
      next: (bids) => {
        this.bids = bids.filter(bid => bid.auction_name === this.auction?.name);
        this.updateHighestBid();
        this.updateUserLastBid();
      },
      error: (err) => {
        console.error('Error loading bids:', err);
        this.showSnackBar('Error al cargar las pujas');
      }
    });
  }

  updateHighestBid(): void {
    if (this.bids.length > 0) {
      this.highestBid = Math.max(...this.bids.map(bid => bid.amount));
    } else if (this.auction) {
      this.highestBid = this.auction.item.init_price;
    }
  }

  updateUserLastBid(): void {
    if (!this.currentUser) return;
    
    const userBids = this.bids.filter(bid => bid.user_name === this.currentUser.user_name);
    if (userBids.length > 0) {
      this.userLastBid = Math.max(...userBids.map(bid => bid.amount));
    } else {
      this.userLastBid = null;
    }
  }

  updateTimeRemaining(): void {
    if (this.auction) {
      const now = new Date().getTime();
      const endTime = new Date(this.auction.end_date).getTime();
      const timeLeft = endTime - now;

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        this.timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        this.timeRemaining = 'Subasta finalizada';
      }
    }
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.showSnackBar(this.isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos');
  }


  

  placeBid(): void {
    if (!this.auction) return;

    const dialogRef = this.dialog.open(BidModalComponent, {
      width: '300px',
      data: { 
        auctionName: this.auction.name, 
        currentBid: this.highestBid, 
        userLastBid: this.userLastBid 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.amount) {
        const newBid: BidRequest = {
          amount: result.amount,
          auction_id: this.auction!.id
        };

        this.bidsService.createBid(newBid).subscribe({
          next: (createdBid) => {
            this.bids.push(createdBid);
            this.updateHighestBid();
            this.updateUserLastBid();
            this.showSnackBar(`Puja realizada: S/.${createdBid.amount}`);
            this.isHammering = true;
            setTimeout(() => {
              this.isHammering = false;
            }, 500);
          },
          error: (err) => {
            console.error('Error creating bid:', err);
            this.showSnackBar('Error al realizar la puja');
          }
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToMyBids(): void { // New method
    this.router.navigate(['/home/my-bids']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  getImageSrc(img?: string): string {
    if (!img) {
      return 'assets/default-item-image.png';
    }
    return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
  }
}