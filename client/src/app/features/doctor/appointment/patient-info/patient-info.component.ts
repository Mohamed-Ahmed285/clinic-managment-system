import { Component, Input } from '@angular/core';
import { PatientInfo } from '../../../../features/doctor/models/appointment.model';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.css']
})
export class PatientInfoComponent {
  @Input() patient!: PatientInfo;
}
