import { Component, Input } from '@angular/core';
import { MedicalHistoryEntry } from '../../../../features/doctor/models/appointment.model';

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent {
  @Input() history: MedicalHistoryEntry[] = [];
}
