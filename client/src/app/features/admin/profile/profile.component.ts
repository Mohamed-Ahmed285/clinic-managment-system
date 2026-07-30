import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService, AdminProfile } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: AdminProfile = { name: '', email: '' };
  loading = true;
  errorMessage = '';

  editMode = false;
  currentProfile: AdminProfile = { name: '', email: '' };

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getMe().subscribe({
      next: (response) => {
        this.profile = response.user;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load profile';
        this.toastr.error('Could not load profile', 'Error');
        this.loading = false;
      }
    });
  }

  openEditForm(): void {
    this.currentProfile = { ...this.profile };
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveProfile(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.profileService.updateMe(this.currentProfile).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        this.editMode = false;
        this.toastr.success('Profile updated', 'Success');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Could not update profile';
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }
}