import { Component, Input } from '@angular/core';
import { PersonalInfo } from '../../models/profile.model';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent {
  @Input() info!: PersonalInfo;

  specialties = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Neurology',
    'General Practice',
    'Orthopedics'
  ];

  get initials(): string {
    if (!this.info?.fullName) {
      return '';
    }
    return this.info.fullName
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      // Wire this up to your upload logic / API call.
      console.log('Selected photo:', input.files[0]);
    }
  }
}
