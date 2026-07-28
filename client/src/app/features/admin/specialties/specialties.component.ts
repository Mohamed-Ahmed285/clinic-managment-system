import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecialtyService, Specialty } from '../services/specialty.service';
import { DoctorService, Doctor } from '../services/doctor.service';

@Component({
  selector: 'app-specialties',
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.css']
})
export class SpecialtiesComponent implements OnInit {
  specialties: Specialty[] = [];
  doctorCounts: { [specialtyId: string]: number } = {};

  loading = true;
  errorMessage = '';

  showForm = false;
  editMode = false;
  editingId: string | null = null;

  specialtyForm: FormGroup;

  constructor(
    private specialtyService: SpecialtyService,
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.specialtyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(300)]],
      icon: ['']
    });
  }

  ngOnInit(): void {
    this.loadSpecialties();
  }

  get name() { return this.specialtyForm.get('name'); }
  get description() { return this.specialtyForm.get('description'); }

  loadSpecialties(): void {
    this.loading = true;
    this.specialtyService.getAll().subscribe({
      next: (response) => {
        this.specialties = response.data;
        this.loadDoctorCounts();
      },
      error: () => {
        this.errorMessage = 'Could not load specialties';
        this.loading = false;
      }
    });
  }

  loadDoctorCounts(): void {
    this.doctorService.getAll().subscribe({
      next: (response) => {
       
        const doctors: Doctor[] = response;
        
        this.doctorCounts = {};

        for (const doctor of doctors) {
          const id = typeof doctor.specialtyId === 'string'
            ? doctor.specialtyId
            : (doctor.specialtyId as any)?._id;

          if (id) {
            this.doctorCounts[id] = (this.doctorCounts[id] || 0) + 1;
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getDoctorCount(specialtyId?: string): number {
    if (!specialtyId) return 0;
    return this.doctorCounts[specialtyId] || 0;
  }

  openAddForm(): void {
    this.editMode = false;
    this.editingId = null;
    this.specialtyForm.reset({ name: '', description: '', icon: '' });
    this.showForm = true;
  }

  openEditForm(specialty: Specialty): void {
    this.editMode = true;
    this.editingId = specialty._id ?? null;
    this.specialtyForm.setValue({
      name: specialty.name,
      description: specialty.description,
      icon: specialty.icon || ''
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveSpecialty(): void {
    if (this.specialtyForm.invalid) {
      this.specialtyForm.markAllAsTouched();
      return;
    }

    const payload: Specialty = this.specialtyForm.value;

    if (this.editMode && this.editingId) {
      this.specialtyService.update(this.editingId, payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadSpecialties();
        },
        error: () => this.errorMessage = 'Could not update specialty'
      });
    } else {
      this.specialtyService.create(payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadSpecialties();
        },
        error: () => this.errorMessage = 'Could not create specialty'
      });
    }
  }

  deleteSpecialty(id: string): void {
    if (!confirm('Delete this specialty?')) return;
    this.specialtyService.delete(id).subscribe({
      next: () => this.loadSpecialties(),
      error: () => this.errorMessage = 'Could not delete specialty'
    });
  }
}