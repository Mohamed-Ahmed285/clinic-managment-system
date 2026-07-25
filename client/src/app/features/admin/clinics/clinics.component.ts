import { Component, OnInit } from '@angular/core';
import { ClinicService, Clinic } from '../services/clinic.service';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css']
})
export class ClinicsComponent implements OnInit {
  clinics: Clinic[] = [];
  loading = true;
  errorMessage = '';

  showForm = false;
  editMode = false;
  currentClinic: Clinic = { name: '', address: { city: '' } };

  constructor(private clinicService: ClinicService) {}

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.loading = true;
    this.clinicService.getAll().subscribe({
      next: (response) => {
        this.clinics = response;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load clinics';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editMode = false;
    this.currentClinic = { name: '', address: { city: '' } };
    this.showForm = true;
  }

  openEditForm(clinic: Clinic): void {
    this.editMode = true;
    this.currentClinic = { ...clinic, address: { ...clinic.address } };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveClinic(): void {
    if (this.editMode && this.currentClinic._id) {
      this.clinicService.update(this.currentClinic._id, this.currentClinic).subscribe({
        next: () => {
          this.showForm = false;
          this.loadClinics();
        },
        error: () => this.errorMessage = 'Could not update clinic'
      });
    } else {
      this.clinicService.create(this.currentClinic).subscribe({
        next: () => {
          this.showForm = false;
          this.loadClinics();
        },
        error: () => this.errorMessage = 'Could not create clinic'
      });
    }
  }

  deleteClinic(id: string): void {
    if (!confirm('Delete this clinic?')) return;
    this.clinicService.delete(id).subscribe({
      next: () => this.loadClinics(),
      error: () => this.errorMessage = 'Could not delete clinic'
    });
  }
}