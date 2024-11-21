import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

import { CustomPaymentResponse } from '../../shared/models/payment-response.model';
import { CustomPaymentRequest, CustomPaymentUpdate } from '../../shared/models/payment-request.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseURL = `${environment.baseURL}/payments`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getUserToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createPayment(payment: CustomPaymentRequest): Observable<CustomPaymentResponse> {
    console.log('Creating payment with data:', payment);
    return this.http.post<CustomPaymentResponse>(this.baseURL, payment, { headers: this.getAuthHeaders() })
      .pipe(
        tap(response => console.log('Payment created successfully:', response)),
        catchError(this.handleError)
      );
  }

  getPaymentById(id: number): Observable<CustomPaymentResponse> {
    return this.http.get<CustomPaymentResponse>(`${this.baseURL}/${id}`, { headers: this.getAuthHeaders() });
  }

  updatePayment(id: number, payment: CustomPaymentUpdate): Observable<CustomPaymentResponse> {
    return this.http.put<CustomPaymentResponse>(`${this.baseURL}/${id}`, payment, { headers: this.getAuthHeaders() });
  }

  getAllPayments(): Observable<CustomPaymentResponse[]> {
    return this.http.get<CustomPaymentResponse[]>(this.baseURL, { headers: this.getAuthHeaders() });
  }

  simulatePayment(cardDetails: any): Observable<any> {
    // Simular un proceso de pago
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Pago simulado exitoso' });
        observer.complete();
      }, 2000);
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}