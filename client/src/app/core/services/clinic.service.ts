import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Clinic {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(
      `${this.api}/clinic`
    );
  }
}