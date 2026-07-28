import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Appointment, Medication } from '../models/appointment.model';
import {
  AppointmentService,
  AppointmentDetailResponse,
  MedicalRecordResponse,
  PrescriptionResponse,
} from 'src/app/core/services/appointment.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
})
export class AppointmentComponent implements OnInit {
  appointment!: Appointment;
  loading = true;
  errorMessage = '';

  saving = false;
  saved = false;

  private appointmentId!: string;
  private existingPrescriptionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.appointmentId) {
      this.errorMessage = 'No appointment was specified.';
      this.loading = false;
      return;
    }

    this.loadAppointment();
  }

  loadAppointment(): void {
    this.loading = true;

    // The patient id needed for history lookup only becomes known once the
    // appointment itself has loaded, so this must happen in two steps.
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        const patientId = appointment.patientId?._id?._id;

        forkJoin({
          // history/prescription lookups can legitimately come back empty - don't let that fail the whole page
          history: patientId
            ? this.appointmentService
                .getMedicalRecordsByPatient(patientId)
                .pipe(catchError(() => of([] as MedicalRecordResponse[])))
            : of([] as MedicalRecordResponse[]),
          prescription: this.appointmentService
            .getPrescriptionByAppointment(this.appointmentId)
            .pipe(catchError(() => of(null as PrescriptionResponse | null)))
        }).subscribe(({ history, prescription }) => {
          this.appointment = this.mapToAppointment(appointment, history, prescription);
          this.existingPrescriptionId = prescription ? prescription._id : null;
          this.loading = false;
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load this appointment.';
        this.loading = false;
      }
    });
  }

  private mapToAppointment(
    appointment: AppointmentDetailResponse,
    history: MedicalRecordResponse[],
    prescription: PrescriptionResponse | null
  ): Appointment {
    const patientUser = appointment.patientId?._id;

    return {
      time: appointment.startTime,
      patient: {
        fullName: patientUser?.name ?? 'Unknown Patient',
        age: this.calculateAge(appointment.patientId?.dateOfBirth),
        gender: appointment.patientId?.gender ?? '',
        phone: patientUser?.phone ?? '',
        visitType: appointment.clinicId?.name ?? 'Clinic Visit',
        visitReason: ''
      },
      history: history
        // most recent history is already sorted server-side, but keep this dependable either way
        .slice()
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
        .map((record) => ({
          date: record.visitDate,
          type: 'Condition',
          description: record.diagnosis
        })),
      medications: prescription?.medications?.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration ?? '',
        times: m.times ?? [],
        notes: m.notes ?? ''
      })) ?? [],
      generalNotes: prescription?.generalNotes ?? '',
      issuedAt: prescription
        ? new Date(prescription.issuedDate).toLocaleString()
        : ''
    };
  }

  private calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) {
      return 0;
    }
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  onSavePrescription(payload: {
    diagnosis: string;
    symptoms: string;
    medications: Medication[];
    generalNotes: string;
  }): void {
    this.saving = true;
    this.errorMessage = '';

    const save$ = this.existingPrescriptionId
      ? this.appointmentService.updatePrescription(
          this.existingPrescriptionId,
          payload.medications,
          payload.generalNotes
        )
      : this.appointmentService.createPrescription(
          this.appointmentId,
          payload.medications,
          payload.generalNotes
        );

    save$.subscribe({
      next: (res) => {
        this.existingPrescriptionId = res._id;
        this.appointment.medications = payload.medications;
        this.appointment.generalNotes = payload.generalNotes;
        this.appointment.issuedAt = new Date(res.issuedDate).toLocaleString();

        // The medical record is created from the diagnosis/symptoms the doctor
        // just entered - no attachments support here by design.
        this.appointmentService
          .createMedicalRecord(
            this.appointmentId,
            payload.diagnosis,
            payload.symptoms,
            payload.generalNotes
          )
          .subscribe({
            next: () => this.completeVisit(),
            error: (err) => {
              console.error(err);
              this.saving = false;
              this.errorMessage = 'Prescription saved, but the medical record could not be created.';
            }
          });
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMessage = 'Could not save the prescription.';
      }
    });
  }

  private completeVisit(): void {
    // Saving the prescription is what marks this visit as done, so complete
    // the appointment right after a successful save.
    this.appointmentService.completeAppointment(this.appointmentId).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => {
          this.router.navigate(['/doctor/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        // The prescription and medical record saved fine here - only completing
        // the appointment failed, so say so rather than a generic save error.
        this.errorMessage = 'Prescription saved, but the appointment could not be marked as completed.';
      }
    });
  }
}
