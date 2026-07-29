import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService, AppUser } from '../services/user.service';
import { SpecialtyService, Specialty } from '../services/specialty.service';
import { ClinicService, Clinic } from '../services/clinic.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  specialties: Specialty[] = [];
  clinics: Clinic[] = [];

  loading = true;
  errorMessage = '';
  roleFilter = '';

  showForm = false;
  editMode = false;
  currentUser: AppUser = {
    name: '',
    email: '',
    password: '',
    role: 'patient',
    address: { city: '', state: '', country: '' },
    clinics: []
  };

  daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  constructor(
    private userService: UserService,
    private specialtyService: SpecialtyService,
    private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.specialtyService.getAll().subscribe({
      next: (res) => this.specialties = res.data
    });
this.clinicService.getAll().subscribe({
  next: (res) => {
    console.log('Clinics response:', res);
    this.clinics = res;
    console.log('Clinics array:', this.clinics);
  }
});
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll(this.roleFilter).subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load users';
        this.loading = false;
      }
    });
  }

  filterByRole(role: string): void {
    this.roleFilter = role;
    this.loadUsers();
  }

  openAddForm(): void {
    this.editMode = false;
    this.errorMessage = '';
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      role: 'patient',
      address: { city: '', state: '', country: '' },
      clinics: []
    };
    this.showForm = true;
  }

  openEditForm(user: AppUser): void {
    this.editMode = true;
    this.errorMessage = '';

    this.userService.getOne(user._id!).subscribe({
      next: (response) => {
        const fetchedUser = response.data.user;
        const profile = response.data.profile;
        this.currentUser = {
          address: { city: '', state: '', country: '' },
          clinics: [],
          ...fetchedUser,
          ...profile
        };
        this.showForm = true;
      },
      error: () => this.errorMessage = 'Could not load user details'
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.errorMessage = '';
  }

  // ============ clinic assignment helpers ============

  addClinicAssignment(): void {
    if (!this.currentUser.clinics) {
      this.currentUser.clinics = [];
    }
    this.currentUser.clinics.push({
      clinicId: '',
      consultationFee: 0,
      availability: [{ day: [], startTime: '', endTime: '' }],
      isActiveAtClinic: true
    });
  }

  removeClinicAssignment(index: number): void {
    this.currentUser.clinics?.splice(index, 1);
  }

  addWorkingHour(clinicIndex: number): void {
    this.currentUser.clinics?.[clinicIndex].availability.push({
      day: [], startTime: '', endTime: ''
    });
  }

  removeWorkingHour(clinicIndex: number, hourIndex: number): void {
    this.currentUser.clinics?.[clinicIndex].availability.splice(hourIndex, 1);
  }

  toggleDay(clinicIndex: number, hourIndex: number, day: string): void {
    const hour = this.currentUser.clinics?.[clinicIndex].availability[hourIndex];
    if (!hour) return;
    const i = hour.day.indexOf(day);
    if (i === -1) {
      hour.day.push(day);
    } else {
      hour.day.splice(i, 1);
    }
  }

  isDaySelected(clinicIndex: number, hourIndex: number, day: string): boolean {
    return this.currentUser.clinics?.[clinicIndex].availability[hourIndex]?.day.includes(day) ?? false;
  }

  // ============ save / delete ============

  saveUser(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.errorMessage = '';

    if (this.editMode && this.currentUser._id) {
      this.userService.update(this.currentUser._id, this.currentUser).subscribe({
        next: () => {
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => this.handleSaveError(err, 'update')
      });
    } else {
      this.userService.create(this.currentUser).subscribe({
        next: () => {
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => this.handleSaveError(err, 'create')
      });
    }
  }

  private handleSaveError(err: any, action: 'create' | 'update'): void {
    const backendMessage: string =
      err.error?.message ||
      err.error?.error ||
      err.error?.msg ||
      (typeof err.error === 'string' ? err.error : '') ||
      '';

    const rawMessage = backendMessage.toLowerCase();

    const isDuplicate =
      err.status === 409 ||
      rawMessage.includes('e11000') ||
      rawMessage.includes('duplicate') ||
      rawMessage.includes('already exists') ||
      rawMessage.includes('unique');

    if (isDuplicate) {
      this.errorMessage = 'An account with this email already exists. Please use a different email.';
    } else if (backendMessage) {
      this.errorMessage = backendMessage;
    } else {
      this.errorMessage = action === 'create' ? 'Could not create user' : 'Could not update user';
    }
  }

  deleteUser(id: string): void {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    this.userService.delete(id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'Could not delete user'
    });
  }
}
