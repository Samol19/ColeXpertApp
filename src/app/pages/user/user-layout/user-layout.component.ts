import { CommonModule } from '@angular/common';
import { Component,HostListener, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, map } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuctionService } from '../../../core/services/auction.service';


@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    NavbarComponent,
    FooterComponent,
    MatTooltipModule
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css',
  animations: [
    trigger('sidebarAnimation', [
      state('closed', style({
        transform: 'translateX(-100%)'
      })),
      state('open', style({
        transform: 'translateX(0)'
      })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ])
  ]
})
export class UserLayoutComponent implements OnInit{
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;

  private router = inject(Router);
  private auctionService= inject(AuctionService);
  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 768;
      if (this.sidenav) {
        if (this.isMobile) {
          this.sidenav.close();
        } else {
          this.sidenav.open();
        }
      }
    }
  }

  closeSidenavOnMobile() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }
  

  goToRandomAuction() {
    this.auctionService.getAllAuctions().pipe(
      map(auctions => auctions.filter(auction => 
        auction.state === 'EN CURSO' || 
        auction.state === 'PROGRAMADA' || 
        auction.state === 'FINALIZADA'
      )),
      map(activeAuctions => activeAuctions.length > 0 ? activeAuctions[Math.floor(Math.random() * activeAuctions.length)] : null)
    ).subscribe({
      next: (randomAuction) => {
        if (randomAuction) {
          this.router.navigate(['/home/catalog/details', randomAuction.id]);
        } else {
          console.log('No hay subastas activas disponibles');
          // Aquí podrías agregar lógica para mostrar un mensaje al usuario
        }
      },
      error: (error) => {
        console.error('Error al obtener las subastas:', error);
        // Aquí podrías agregar lógica para mostrar un mensaje de error al usuario
      }
    });
  }
}
