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

//   logout(): void {

//   localStorage.removeItem('token');
//   localStorage.removeItem('user');

//   this.router.navigate(['/login']);

// }
}

}
