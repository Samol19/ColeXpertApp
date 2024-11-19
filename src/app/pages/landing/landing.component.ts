import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  isLoading: boolean = true;
  faqItems: any[] = [
    {
      question: 'Non consectetur a erat nam at lectus urna duis?',
      answer: 'Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non.',
      isActive: true
    },
    {
      question: 'Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque?',
      answer: 'Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi. Id interdum velit laoreet id donec ultrices. Fringilla phasellus faucibus scelerisque eleifend donec pretium. Est pellentesque elit ullamcorper dignissim. Mauris ultrices eros in cursus turpis massa tincidunt dui.',
      isActive: false
    },
    // Add more FAQ items here
  ];

  constructor() {}

  ngOnInit() {
  }

  toggleFaqItem(item: any) {
    item.isActive = !item.isActive;
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form submitted', form.value);
      // Here you would typically send the form data to a server
    }
  }
}