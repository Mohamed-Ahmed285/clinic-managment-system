import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointment`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.authHeaders() });
  }

  cancel(id: string, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, { reason }, { headers: this.authHeaders() });
  }

  complete(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/complete`, {}, { headers: this.authHeaders() });
  }
}