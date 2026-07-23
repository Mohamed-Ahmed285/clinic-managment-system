import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferredPaymentMethod?: string;
  profileImage?: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/user/login`,
      data
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(
      `${this.api}/patient/register`,
      data
    );
  }

}
