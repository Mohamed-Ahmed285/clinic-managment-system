import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getAllSpecialties() {
    return this.http.get(`${environment.apiUrl}/specialty`);
  }
  // getDoctors(page: number, limit: number, search: string) {
  //   return this.http.get(
  //     `${environment.apiUrl}/doctor?page=${page}&limit=${limit}&search=${search}`,
  //   );
  // }
  getDoctors(
    page: number,
    limit: number,
    search: string,
    specialty: string,
    state: string,
  ) {
    return this.http.get(
      `${environment.apiUrl}/doctor/search?page=${page}&limit=${limit}&search=${search}&specialty=${specialty}&state=${state}`,
    );
  }
  bookAppointment(data: any) {
    return this.http.post(`${environment.apiUrl}/appointment`, data);
  }
  getMyAppointments() {
    return this.http.get(`${environment.apiUrl}/appointment/my`);
  }
}
