import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { headers: this.authHeaders() });
  }

  updateMe(data: AdminProfile): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data, { headers: this.authHeaders() });
  }
}