import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Doctor {
  _id?: string;
  userId: string;
  bio?: string;
  experienceYears?: number;
  specialtyId: string | { _id: string; name: string }; // string when not populated, object when populated
  clinics?: any[];
  rating?: { average: number; count: number };
  bookingStats?: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctor`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getOne(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}