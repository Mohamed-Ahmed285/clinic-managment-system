import { Component, Input, OnInit } from '@angular/core';
import { PersonalInfo } from '../../models/profile.model';
import { SpecialtyService, Specialty } from 'src/app/core/services/specialty.service';
import { DoctorService } from 'src/app/core/services/doctor.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {

  @Input() info!: PersonalInfo;

  specialties: Specialty[] = [];

  constructor(
  private specialtyService: SpecialtyService,
  private doctorService: DoctorService
) {}

  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.specialtyService.getAllSpecialties().subscribe({
      next: (data) => {
        this.specialties = data;
      },
      error: (err) => {
        console.error('Failed to load specialties', err);
      }
    });
  }

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

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0];

  console.log('Selected photo:', file);


  this.doctorService.uploadProfilePhoto(file).subscribe({

    next: (res) => {

      console.log('Upload success:', res);

      this.info.profileImage = res.profileImage;

    },

    error: (err) => {

      console.error('Upload failed:', err);

    }

  });

}
}