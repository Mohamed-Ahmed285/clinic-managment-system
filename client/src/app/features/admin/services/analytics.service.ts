import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getOverview(): Observable<any> { return this.http.get(`${this.apiUrl}/overview`, { headers: this.authHeaders() }); }
  getAppointmentStats(): Observable<any> { return this.http.get(`${this.apiUrl}/appointments`, { headers: this.authHeaders() }); }
  getDoctorStats(): Observable<any> { return this.http.get(`${this.apiUrl}/doctors`, { headers: this.authHeaders() }); }
  getSpecialtyStats(): Observable<any> { return this.http.get(`${this.apiUrl}/specialties`, { headers: this.authHeaders() }); }
  getDoctorPerformance(): Observable<any> { return this.http.get(`${this.apiUrl}/doctor-performance`, { headers: this.authHeaders() }); }
}