import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clinic } from '../../models/profile.model';
import { Clinic as ApiClinic } from 'src/app/core/services/clinic.service';

@Component({
  selector: 'app-clinic-card',
  templateUrl: './clinic-card.component.html',
  styleUrls: ['./clinic-card.component.css']
})
export class ClinicCardComponent {

  @Input() clinic!: Clinic;

  @Input() availableClinics: ApiClinic[] = [];

  @Output() remove = new EventEmitter<void>();
  @Output() save = new EventEmitter<Clinic>();

  onRemoveClinic(): void {
    this.remove.emit();
  }

  onSaveClinic(): void {
    this.save.emit(this.clinic);
  }

  addEntry(): void {
    this.clinic.schedule.push({
      days: [],
      start: '09:00',
      end: '17:00'
    });
  }

  removeEntry(index: number): void {
    this.clinic.schedule.splice(index, 1);
  }

  toggleStatus(): void {
    this.clinic.isActiveAtClinic = !this.clinic.isActiveAtClinic;

    this.clinic.status = this.clinic.isActiveAtClinic
      ? 'Active'
      : 'Inactive';
  }

  onClinicSelected(): void {

    const selected = this.availableClinics.find(
      c => c._id === this.clinic.selectedClinicId
    );

    if (!selected) {
      return;
    }

    // Store the selected clinic ID
    this.clinic.selectedClinicId = selected._id;

    // Update displayed information
    this.clinic.name = selected.name;

    this.clinic.address =
      `${selected.address.street}, ${selected.address.city}`;
  }

}