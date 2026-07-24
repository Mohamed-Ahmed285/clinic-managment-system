import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScheduleEntry, WEEK_DAYS } from '../../models/profile.model';

@Component({
  selector: 'app-schedule-entry',
  templateUrl: './schedule-entry.component.html',
  styleUrls: ['./schedule-entry.component.css']
})
export class ScheduleEntryComponent {
  @Input() entry!: ScheduleEntry;
  @Output() remove = new EventEmitter<void>();

  days = WEEK_DAYS;

  isSelected(day: string): boolean {
    return this.entry.days.includes(day);
  }

  toggleDay(day: string): void {
    const index = this.entry.days.indexOf(day);

    if (index >= 0) {
      this.entry.days.splice(index, 1);
    } else {
      this.entry.days.push(day);
    }
  }

  onRemove(): void {
    this.remove.emit();
  }
}
