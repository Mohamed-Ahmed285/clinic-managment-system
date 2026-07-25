import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileData: any;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile!: File;
  // Popup
  isPopupOpen = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.profileData = res;
        if (this.profileData?.profile?.dateOfBirth) {
          this.profileData.profile.dateOfBirth =
            this.profileData.profile.dateOfBirth.split('T')[0];
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result;
    };

    reader.readAsDataURL(file);
  }
  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }
  getInitials(name: string = ''): string {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 0) return '';

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  saveChanges() {
    const formData = new FormData();

    formData.append('name', this.profileData.user.name);
    formData.append('phone', this.profileData.user.phone);

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    const body = {
      dateOfBirth: this.profileData.profile.dateOfBirth,
      gender: this.profileData.profile.gender,
      address: this.profileData.profile.address,
      preferredPaymentMethod: this.profileData.profile.preferredPaymentMethod,
      notificationsEnabled: this.profileData.profile.notificationsEnabled,
    };

    this.profileService.updateUser(formData).subscribe({
      next: (userRes: any) => {
        this.profileService.updateProfile(body).subscribe({
          next: (patientRes: any) => {
            console.log('Updated Successfully', patientRes);

            this.profileData = patientRes;

            localStorage.setItem('user', JSON.stringify(patientRes.user));

            alert('Profile updated successfully');
          },
          error: (err) => {
            console.log(err);
          },
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
