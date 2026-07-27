import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
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
  providedIn: 'root',
})
export class AuthService {
  private api = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${this.api}/user/login`,
      data,
    ).pipe(
      tap((response) => {
        // State is now managed by the service
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.api}/patient/register`, data);
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
