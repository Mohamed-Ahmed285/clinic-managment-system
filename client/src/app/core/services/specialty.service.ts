import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Specialty {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllSpecialties(): Observable<Specialty[]> {
  return this.http.get<{success: boolean, data: Specialty[]}>(
    `${this.api}/specialty`
  ).pipe(
    map(response => response.data)
  );
}

}