import { Component, Input } from '@angular/core';
import { Appointment } from '../models/dashboard.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  @Input() appointments: Appointment[] = [];

  statusClass(status: Appointment['status']): string {
    return 'status status--' + status.toLowerCase().replace(/\s+/g, '-');
  }
}
