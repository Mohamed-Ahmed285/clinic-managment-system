import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppointmentDetailResponse {
  _id: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  status: string;
  patientId: {
    _id: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      profileImage?: string;
    };
    dateOfBirth?: string;
    gender?: string;
  };
  doctorId: any;
  clinicId: {
    _id: string;
    name: string;
  };
}

export interface MedicalRecordResponse {
  _id: string;
  patientId: any;
  doctorId: any;
  appointmentId: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  attachments?: string[];
  visitDate: string;
}

export interface MedicationPayload {
  name: string;
  dosage: string;
  frequency: string;
  durationValue?: number;
  durationUnit?: 'days' | 'weeks';
  times?: string[];
  notes?: string;
}

export interface PrescriptionResponse {
  _id: string;
  patientId: any;
  doctorId: any;
  appointmentId: string;
  medications: MedicationPayload[];
  generalNotes?: string;
  issuedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get a single appointment by id (patient, doctor, and clinic populated)
  getAppointmentById(id: string): Observable<AppointmentDetailResponse> {
    return this.http.get<AppointmentDetailResponse>(
      `${this.api}/appointment/${id}`
    );
  }

  // Get a patient's medical history, most recent first
  getMedicalRecordsByPatient(patientId: string): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(
      `${this.api}/medicalRecord/patient/${patientId}`
    );
  }

  // Get the existing prescription for an appointment, if one exists
  getPrescriptionByAppointment(appointmentId: string): Observable<PrescriptionResponse> {
    return this.http.get<PrescriptionResponse>(
      `${this.api}/prescription/appointment/${appointmentId}`
    );
  }

  // Create a new prescription for an appointment (fails if one already exists)
  createPrescription(
    appointmentId: string,
    medications: MedicationPayload[],
    generalNotes: string
  ): Observable<PrescriptionResponse> {
    return this.http.post<PrescriptionResponse>(
      `${this.api}/prescription`,
      { appointmentId, medications, generalNotes }
    );
  }

  // Update an existing prescription
  updatePrescription(
    prescriptionId: string,
    medications: MedicationPayload[],
    generalNotes: string
  ): Observable<PrescriptionResponse> {
    return this.http.put<PrescriptionResponse>(
      `${this.api}/prescription/${prescriptionId}`,
      { medications, generalNotes }
    );
  }

  // Mark the appointment as completed (requires a prescription to already exist)
  completeAppointment(appointmentId: string): Observable<any> {
    return this.http.patch<any>(
      `${this.api}/appointment/${appointmentId}/complete`,
      {}
    );
  }

  // Create a medical record for this visit. No attachments support here by design.
  createMedicalRecord(
    appointmentId: string,
    diagnosis: string,
    symptoms: string,
    notes: string
  ): Observable<MedicalRecordResponse> {
    return this.http.post<MedicalRecordResponse>(
      `${this.api}/medicalRecord`,
      { appointmentId, diagnosis, symptoms, notes }
    );
  }
}
