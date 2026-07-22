import { Component, Input } from '@angular/core';
import { Clinic } from '../../models/profile.model';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css']
})
export class ClinicsComponent {
  @Input() clinics!: Clinic[];

  addClinic(): void {
    this.clinics.push({
      name: 'New clinic',
      address: '',
      status: 'Active',
      consultationFee: 0,
      schedule: []
    });
  }

  removeClinic(index: number): void {
    this.clinics.splice(index, 1);
  }
}
