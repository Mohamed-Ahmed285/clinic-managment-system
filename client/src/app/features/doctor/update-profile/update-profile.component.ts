import { Component } from '@angular/core';
import { Clinic, PersonalInfo } from './models/profile.model';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent {
  personalInfo: PersonalInfo = {
    fullName: 'Dr. Sana Nakamura',
    email: 's.nakamura@meridian.health',
    phone: '(415) 555-0142',
    yearsExperience: 12,
    specialty: 'Cardiology',
    appointmentDuration: 30,
    bio:
      'Cardiologist focused on preventive care, arrhythmia management, and ' +
      'post-op recovery. Clinical interests include shared decision-making ' +
      'and long-term risk reduction.'
  };

  clinics: Clinic[] = [
    {
      name: 'Meridian Pavilion — Cardiology Suite',
      address: 'Floor 4, Suite 412 · 200 Bay St',
      status: 'Active',
      consultationFee: 180,
      schedule: [
        { days: ['Mon', 'Wed', 'Fri'], start: '09:00', end: '13:00' },
        { days: ['Tue', 'Thu'], start: '14:00', end: '18:00' }
      ]
    },
    {
      name: 'Bayside Community Clinic',
      address: '1120 Ocean Ave, Suite 3',
      status: 'Inactive',
      consultationFee: 120,
      schedule: [
        { days: ['Sat'], start: '10:00', end: '14:00' }
      ]
    }
  ];

  onSave(): void {
    // TODO: replace with a real API call, e.g.:
    // this.profileService.updateProfile(this.personalInfo, this.clinics).subscribe(...)
    console.log('Saving profile…', this.personalInfo, this.clinics);
  }
}
