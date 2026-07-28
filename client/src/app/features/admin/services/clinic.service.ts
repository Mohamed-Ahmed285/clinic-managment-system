import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Clinic {
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
  image?: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private apiUrl = `${environment.apiUrl}/clinic`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<any> { return this.http.get(this.apiUrl); }
  getOne(id: string): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  create(data: Clinic): Observable<any> { return this.http.post(this.apiUrl, data, { headers: this.authHeaders() }); }
  update(id: string, data: Clinic): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.authHeaders() }); }
  delete(id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authHeaders() }); }
}