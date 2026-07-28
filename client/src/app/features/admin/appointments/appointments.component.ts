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

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (response) => {
        this.allAppointments = response.data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.appointments = this.activeFilter
      ? this.allAppointments.filter(a => a.status === this.activeFilter)
      : this.allAppointments;
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


