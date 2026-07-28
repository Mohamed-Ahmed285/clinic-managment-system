import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getProfile() {
    const token = localStorage.getItem('token');

    return this.http.get(`${environment.apiUrl}/user/me`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
  updateProfile(data: any) {
    const token = localStorage.getItem('token');

    return this.http.put(
      `${environment.apiUrl}/patient/updateMyProfile`,
      data,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      },
    );
  }
  updateUser(formData: FormData) {
    const token = localStorage.getItem('token');

    return this.http.put(`${environment.apiUrl}/user/me`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
  getMedicalRecords(patientId: string) {
    const token = localStorage.getItem('token');

    return this.http.get(
      `${environment.apiUrl}/medicalRecord/patient/${patientId}`,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      },
    );
  }
}
