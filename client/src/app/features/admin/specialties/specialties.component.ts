import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  showConfirm = false;
selectedSpecialtyId = '';

  constructor(
    private specialtyService: SpecialtyService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private toastr: ToastrService
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
  openConfirm(id: string): void {
  this.selectedSpecialtyId = id;
  this.showConfirm = true;
}

  get name() { return this.specialtyForm.get('name'); }
  get description() { return this.specialtyForm.get('description'); }

  loadSpecialties(): void {
    this.loading = true;
    this.specialtyService.getAll().subscribe({
      next: (response) => {
        this.specialties = response.data;
        this.currentPage = 1; // reset to page 1 whenever the list reloads
        this.loadDoctorCounts();
      },
      error: () => {
        this.errorMessage = 'Could not load specialties';
        this.toastr.error('Could not load specialties', 'Error');
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

  // ---- Pagination helpers ----

  get totalPages(): number {
    return Math.ceil(this.specialties.length / this.itemsPerPage) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedSpecialties(): Specialty[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.specialties.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
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
          this.toastr.success('Specialty updated', 'Success');
        },
        error: () => {
          this.errorMessage = 'Could not update specialty';
          this.toastr.error('Could not update specialty', 'Error');
        }
      });
    } else {
      this.specialtyService.create(payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadSpecialties();
          this.toastr.success('Specialty created', 'Success');
        },
        error: () => {
          this.errorMessage = 'Could not create specialty';
          this.toastr.error('Could not create specialty', 'Error');
        }
      });
    }
  }

  deleteSpecialty(id: string): void {
    // if (!confirm('Delete this specialty?')) return;
    this.specialtyService.delete(id).subscribe({
      next: () => {
        this.showConfirm = false;
      this.selectedSpecialtyId = '';
        this.loadSpecialties();
        this.toastr.success('Specialty deleted', 'Success');
      },
      error: () => {
        this.errorMessage = 'Could not delete specialty';
        this.toastr.error('Could not delete specialty', 'Error');
      }
    });
  }
}
