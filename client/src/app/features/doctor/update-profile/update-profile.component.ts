import { Component, OnInit } from '@angular/core';
import { Clinic, PersonalInfo } from './models/profile.model';
import { DoctorService } from 'src/app/core/services/doctor.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit {

  personalInfo: PersonalInfo = {
    fullName: '',
    email: '',
    phone: '',
    yearsExperience: 0,
    specialtyId: '',
    appointmentDuration: 15,
    bio: ''
  };

  clinics: Clinic[] = [];

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.doctorService.getMyProfile().subscribe({
      next: (doctor: any) => {

        this.personalInfo = {
          fullName: doctor._id?.name || '',
          email: doctor._id?.email || '',
          phone: doctor._id?.phone || '',
          yearsExperience: doctor.experienceYears || 0,
          profileImage: doctor._id?.profileImage || '',
          // Store specialty ID, not the name
          specialtyId: doctor.specialtyId?._id || '',

          appointmentDuration: doctor.appointmentDurationMinutes || 15,
          bio: doctor.bio || ''
        };

this.clinics = (doctor.clinics || []).map((clinic: any) => {

  console.log(clinic.clinicId);
  console.log(clinic.clinicId.address);

  return {
    id: clinic.clinicId?._id,
    name: clinic.clinicId?.name,
    address: clinic.clinicId?.address
  ? `${clinic.clinicId.address.street},
     ${clinic.clinicId.address.city},
     ${clinic.clinicId.address.state},
     ${clinic.clinicId.address.country}`
  : '',
    status: clinic.isActiveAtClinic ? 'Active' : 'Inactive',
    isActiveAtClinic: clinic.isActiveAtClinic,
    consultationFee: clinic.consultationFee,

    schedule: (clinic.availability || []).map((item: any) => ({
      days: item.day,
      start: item.startTime,
      end: item.endTime
    }))
  };

});

      },

      error: (err) => {
        console.error('Failed to load doctor profile:', err);
      }
    });
  }


  onSave(): void {

    const body = {

      name: this.personalInfo.fullName,
      email: this.personalInfo.email,
      phone: this.personalInfo.phone,

      bio: this.personalInfo.bio,
      experienceYears: this.personalInfo.yearsExperience,

      // Send specialty ID to backend
      specialtyId: this.personalInfo.specialtyId,

      appointmentDurationMinutes: this.personalInfo.appointmentDuration

    };


    this.doctorService.updateMyProfile(body).subscribe({

      next: () => {
        alert('Profile updated successfully.');
      },

      error: (err) => {
        console.error('Failed to update profile:', err);
        alert('Failed to update profile.');
      }

    });

  }

}