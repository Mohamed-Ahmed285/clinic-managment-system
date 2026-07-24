import { Component, Input, OnInit } from '@angular/core';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { Clinic } from '../../models/profile.model';
import {
  ClinicService,
  Clinic as ApiClinic
} from 'src/app/core/services/clinic.service';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css']
})
export class ClinicsComponent implements OnInit {

  @Input() clinics!: Clinic[];

  availableClinics: ApiClinic[] = [];

  constructor(
    private doctorService: DoctorService,
    private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAllClinics().subscribe({
      next: (data: ApiClinic[]) => {
        this.availableClinics = data;
        console.log('Available clinics:', data);
      },
      error: (err: any) => {
        console.error('Failed to load clinics', err);
      }
    });
  }

  addClinic(): void {
    this.clinics.push({
      id: '',
      selectedClinicId: '',
      name: '',
      address: '',
      status: 'Active',
      isActiveAtClinic: true,
      consultationFee: 0,
      schedule: []
    });
  }

  removeClinic(index: number): void {

    const clinic = this.clinics[index];

    // Clinic hasn't been saved yet
    if (!clinic.id) {
      this.clinics.splice(index, 1);
      return;
    }

    // Remove from database
    this.doctorService.deleteClinic(clinic.id).subscribe({
      next: () => {
        this.clinics.splice(index, 1);
        alert('Clinic removed successfully');
      },
      error: (err: any) => {
        console.error('Delete clinic error:', err);
        console.error(err.error);
        alert('Failed to remove clinic');
      }
    });
  }

  saveClinic(clinic: Clinic): void {

    const body = {
      clinicId: clinic.selectedClinicId || clinic.id,
      consultationFee: clinic.consultationFee,
      isActiveAtClinic: clinic.isActiveAtClinic,
      availability: clinic.schedule.map(entry => ({
        day: entry.days,
        startTime: entry.start,
        endTime: entry.end
      }))
    };

    // Existing clinic assignment
    if (clinic.id) {

      this.doctorService.updateClinic(clinic.id, body).subscribe({
        next: () => {
          alert('Clinic updated successfully');
        },
        error: (err: any) => {
          console.error('Update clinic error:', err);
          console.error(err.error);
          alert('Failed to update clinic');
        }
      });

    }

    // New clinic assignment
    else {

      this.doctorService.addClinic(body).subscribe({
        next: () => {
          alert('Clinic added successfully');
        },
        error: (err: any) => {
          console.error('Add clinic error:', err);
          console.error(err.error);
          alert('Failed to add clinic');
        }
      });

    }

  }

}