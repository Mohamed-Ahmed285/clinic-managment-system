import { Component, OnInit } from '@angular/core';
import { SpecialtyService, Specialty } from '../services/specialty.service';

@Component({
  selector: 'app-specialties',
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.css']
})
export class SpecialtiesComponent implements OnInit {
  specialties: Specialty[] = [];
  loading = true;
  errorMessage = '';

  showForm = false;
  editMode = false;
  currentSpecialty: Specialty = { name: '', description: '', icon: '' };

  constructor(private specialtyService: SpecialtyService) {}

  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.loading = true;
    this.specialtyService.getAll().subscribe({
      next: (response) => {
        this.specialties = response.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load specialties';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editMode = false;
    this.currentSpecialty = { name: '', description: '', icon: '' };
    this.showForm = true;
  }

  openEditForm(specialty: Specialty): void {
    this.editMode = true;
    this.currentSpecialty = { ...specialty };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveSpecialty(): void {
    if (this.editMode && this.currentSpecialty._id) {
      this.specialtyService.update(this.currentSpecialty._id, this.currentSpecialty).subscribe({
        next: () => {
          this.showForm = false;
          this.loadSpecialties();
        },
        error: () => this.errorMessage = 'Could not update specialty'
      });
    } else {
      this.specialtyService.create(this.currentSpecialty).subscribe({
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