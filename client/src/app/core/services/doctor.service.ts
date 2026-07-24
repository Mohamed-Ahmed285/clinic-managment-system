import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface WorkingHour {
  day: string[];
  startTime: string;
  endTime: string;
}

export interface ClinicAssignment {
  clinicId: any;
  consultationFee: number;
  availability: WorkingHour[];
  isActiveAtClinic: boolean;
}

export interface DoctorProfile {
  _id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
    role: string;
  };

  bio: string;
  experienceYears: number;
  specialtyId: any;
  appointmentDurationMinutes: number;
  clinics: ClinicAssignment[];
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get logged-in doctor's profile
  getMyProfile(): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(
      `${this.api}/doctor/me`
    );
  }

  // Update doctor's personal information
  updateMyProfile(data: any): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(
      `${this.api}/doctor/me`,
      data
    );
  }

  // Add a clinic
  addClinic(data: any): Observable<DoctorProfile> {
    return this.http.post<DoctorProfile>(
      `${this.api}/doctor/me/clinics`,
      data
    );
  }

  // Update an existing clinic
  updateClinic(
    clinicId: string,
    data: any
  ): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(
      `${this.api}/doctor/me/clinics/${clinicId}`,
      data
    );
  }

  // Remove a clinic
  deleteClinic(
    clinicId: string
  ): Observable<DoctorProfile> {
    return this.http.delete<DoctorProfile>(
      `${this.api}/doctor/me/clinics/${clinicId}`
    );
  }


  uploadProfilePhoto(file: File): Observable<any> {

  const formData = new FormData();

  formData.append('profileImage', file);

  return this.http.post<any>(
    `${this.api}/doctor/me/photo`,
    formData
  );
}
}