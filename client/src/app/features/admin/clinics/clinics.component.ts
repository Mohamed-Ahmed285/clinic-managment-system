import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
showConfirm = false;
selectedClinicId = '';
  showForm = false;
  editMode = false;
  editingId: string | null = null;

  clinicForm: FormGroup;

  constructor(
    private clinicService: ClinicService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.clinicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: [''],
      email: ['', [Validators.email]],
      image: [''],
      address: this.fb.group({
        street: [''],
        city: ['', [Validators.required]],
        state: [''],
        country: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadClinics();
  }
openConfirm(id: string): void {
  this.selectedClinicId = id;
  this.showConfirm = true;
}
  // convenience getters
  get name() { return this.clinicForm.get('name'); }
  get email() { return this.clinicForm.get('email'); }
  get city() { return this.clinicForm.get('address.city'); }

  loadClinics(): void {
    this.loading = true;
    this.clinicService.getAll().subscribe({
      next: (response) => {
        this.clinics = response;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load clinics';
        this.toastr.error('Could not load clinics', 'Error');
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editMode = false;
    this.editingId = null;
    this.clinicForm.reset({
      name: '', phone: '', email: '', image: '',
      address: { street: '', city: '', state: '', country: '' }
    });
    this.showForm = true;
  }

  openEditForm(clinic: Clinic): void {
    this.editMode = true;
    this.editingId = clinic._id ?? null;
    this.clinicForm.setValue({
      name: clinic.name || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      image: clinic.image || '',
      address: {
        street: clinic.address?.street || '',
        city: clinic.address?.city || '',
        state: clinic.address?.state || '',
        country: clinic.address?.country || ''
      }
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveClinic(): void {
    if (this.clinicForm.invalid) {
      this.clinicForm.markAllAsTouched();
      return;
    }

    const payload: Clinic = this.clinicForm.value;

    if (this.editMode && this.editingId) {
      this.clinicService.update(this.editingId, payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadClinics();
          this.toastr.success('Clinic updated', 'Success');
        },
        error: () => {
          this.errorMessage = 'Could not update clinic';
          this.toastr.error('Could not update clinic', 'Error');
        }
      });
    } else {
      this.clinicService.create(payload).subscribe({
        next: () => {
          this.showForm = false;
          this.loadClinics();
          this.toastr.success('Clinic created', 'Success');
        },
        error: () => {
          this.errorMessage = 'Could not create clinic';
          this.toastr.error('Could not create clinic', 'Error');
        }
      });
    }
  }

  deleteClinic(id: string): void {
    // if (!confirm('Delete this clinic?')) return;
    this.clinicService.delete(id).subscribe({
      next: () => {
          this.showConfirm = false;
      this.selectedClinicId = '';

        this.loadClinics();
        this.toastr.success('Clinic deleted', 'Success');
      },
      error: () => {
        this.errorMessage = 'Could not delete clinic';
        this.toastr.error('Could not delete clinic', 'Error');
      }
    });
  }
}
