import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  allAppointments: any[] = [];
  appointments: any[] = [];
  loading = true;
  activeFilter = '';
  searchTerm = '';

  statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (response) => {
        console.log('Appointments response:', response);
        this.allAppointments = response;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // count of appointments per status, for the stat cards
  countByStatus(status: string): number {
    return this.allAppointments.filter(a => a.status === status).length;
  }

 applyFilter(): void {
  let result = this.activeFilter
    ? this.allAppointments.filter(a => a.status === this.activeFilter)
    : this.allAppointments;

  if (this.searchTerm.trim()) {
    const term = this.searchTerm.trim().toLowerCase();

    result = result.filter(a => {
      const patient = a.patientId?._id?.name?.toLowerCase() ?? '';
      const doctor = a.doctorId?._id?.name?.toLowerCase() ?? '';
      const clinic = a.clinicId?.name?.toLowerCase() ?? '';

      return (
        patient.includes(term) ||
        doctor.includes(term) ||
        clinic.includes(term)
      );
    });
  }

  this.appointments = result;
}

  onSearchChange(): void {
    this.applyFilter();
  }

  filterByStatus(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  cancelAppointment(id: string): void {
    const reason = prompt('Reason for cancellation:');
    if (reason === null) return;
    this.appointmentService.cancel(id, reason).subscribe({
      next: () => this.loadAppointments()
    });
  }

  completeAppointment(id: string): void {
    this.appointmentService.complete(id).subscribe({
      next: () => this.loadAppointments()
    });
  }
}