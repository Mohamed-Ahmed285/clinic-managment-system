import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:3000/payment';

  constructor(private http: HttpClient) {}

  checkout(appointmentId: string): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/checkout`,
      { appointmentId },
      { headers }
    );
  }
}