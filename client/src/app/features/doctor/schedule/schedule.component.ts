import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '../models/dashboard.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {

  @Input() appointments: Appointment[] = [];

  selectedAppointmentId: string | null = null;

  constructor(private router: Router) {}

  statusClass(status: Appointment['status']): string {
    return 'status status--' + status.toLowerCase().replace(/\s+/g, '-');
  }

 selectAppointment(appointment: Appointment) {
  this.selectedAppointmentId = appointment.id;
  this.router.navigate(['/doctor/appointment']);
}
}