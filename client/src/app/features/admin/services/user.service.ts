import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WorkingHour {
  day: string[];
  startTime: string;
  endTime: string;
}

export interface ClinicAssignment {
  clinicId: string;
  consultationFee: number;
  availability: WorkingHour[];
  isActiveAtClinic?: boolean;
}
export interface AppUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  profileImage?: string;
  role: 'patient' | 'doctor' | 'admin';

  // patient-only fields
  dateOfBirth?: string;
  gender?: string;
  address?: { city?: string; state?: string; country?: string };
  preferredPaymentMethod?: string;
  notificationsEnabled?: boolean;

  // doctor-only fields
  bio?: string;
  experienceYears?: number;
  specialtyId?: string;
  appointmentDurationMinutes?: number;
  clinics?: ClinicAssignment[];
  
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private adminUrl = `${environment.apiUrl}/admin/users`;
  private createUrl = `${environment.apiUrl}/user/createUser`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(role?: string, search?: string): Observable<any> {
    let url = this.adminUrl;
    const params: string[] = [];
    if (role) params.push(`role=${role}`);
    if (search) params.push(`search=${search}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get(url, { headers: this.authHeaders() });
  }

  getOne(id: string): Observable<any> {
    return this.http.get(`${this.adminUrl}/${id}`, { headers: this.authHeaders() });
  }

  create(data: AppUser): Observable<any> {
    return this.http.post(this.createUrl, data, { headers: this.authHeaders() });
  }

  update(id: string, data: AppUser): Observable<any> {
    return this.http.put(`${this.adminUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`, { headers: this.authHeaders() });
  }
}