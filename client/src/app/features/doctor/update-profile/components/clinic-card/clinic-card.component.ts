import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clinic, ScheduleEntry } from '../../models/profile.model';

@Component({
  selector: 'app-clinic-card',
  templateUrl: './clinic-card.component.html',
  styleUrls: ['./clinic-card.component.css']
})
export class ClinicCardComponent {
  @Input() clinic!: Clinic;
  @Output() remove = new EventEmitter<void>();

  onRemoveClinic(): void {
    this.remove.emit();
  }

  addEntry(): void {
    this.clinic.schedule.push({ days: [], start: '09:00', end: '17:00' });
  }

  removeEntry(index: number): void {
    this.clinic.schedule.splice(index, 1);
  }

  toggleStatus(): void {
    this.clinic.status = this.clinic.status === 'Active' ? 'Inactive' : 'Active';
  }
}
