import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService, AppUser } from '../services/user.service';
import { SpecialtyService, Specialty } from '../services/specialty.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  specialties: Specialty[] = [];
  loading = true;
  errorMessage = '';

  roleFilter = '';

  showForm = false;
  editMode = false;
  currentUser: AppUser = { name: '', email: '', password: '', role: 'patient', address: { city: '', state: '', country: '' } };

  constructor(
    private userService: UserService,
    private specialtyService: SpecialtyService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.specialtyService.getAll().subscribe({
      next: (res) => this.specialties = res.data
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
    this.currentUser = { name: '', email: '', password: '', role: 'patient', address: { city: '', state: '', country: '' } };
    this.showForm = true;
  }

  openEditForm(user: AppUser): void {
    this.editMode = true;
    this.errorMessage = '';

    // fetch the full profile (base user + patient/doctor-specific fields)
    this.userService.getOne(user._id!).subscribe({
      next: (response) => {
        const fetchedUser = response.data.user;
        const profile = response.data.profile;
        this.currentUser = { address: { city: '', state: '', country: '' }, ...fetchedUser, ...profile };
        this.showForm = true;
      },
      error: () => this.errorMessage = 'Could not load user details'
    });
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveUser(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    if (this.editMode && this.currentUser._id) {
      this.userService.update(this.currentUser._id, this.currentUser).subscribe({
        next: () => {
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => this.errorMessage = err.error?.message || 'Could not update user'
      });
    } else {
      this.userService.create(this.currentUser).subscribe({
        next: () => {
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => this.errorMessage = err.error?.message || 'Could not create user'
      });
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