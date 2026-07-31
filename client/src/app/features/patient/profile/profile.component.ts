
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileData: any;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile!: File;

  // Generic Popup (For Appointments / Medical Records View)
  isPopupOpen = false;

  // Image Error Popup Modal
  isErrorPopupOpen = false;
  errorMessage: string | null = null;

  constructor(
    private profileService: ProfileService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.profileData = res;
        if (this.profileData?.profile?.dateOfBirth) {
          this.profileData.profile.dateOfBirth =
            this.profileData.profile.dateOfBirth.split('T')[0];
        }
        this.loadMedicalRecords();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;


    const allowedExtensions = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!allowedExtensions.includes(file.type)) {
      this.showImageError(event, 'This image is not suitable as extension');
      return;
    }


    const isValidRealImage = await this.validateRealImageSignature(file);

    if (!isValidRealImage) {
      this.showImageError(event, 'This image is not suitable as extension');
      return;
    }


    this.errorMessage = null;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  private validateRealImageSignature(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      const blob = file.slice(0, 12);
      reader.readAsArrayBuffer(blob);

      reader.onloadend = () => {
        if (!reader.result) {
          resolve(false);
          return;
        }

        const uint = new Uint8Array(reader.result as ArrayBuffer);
        let bytes: string[] = [];
        uint.forEach((byte) => {
          bytes.push(byte.toString(16).padStart(2, '0'));
        });
        const header = bytes.join('').toUpperCase();

        const isPNG = header.startsWith('89504E47'); // PNG signature
        const isJPEG = header.startsWith('FFD8FF'); // JPEG/JPG signature
        const isWEBP =
          header.startsWith('52494646') && header.includes('57454250'); // RIFF....WEBP

        resolve(isPNG || isJPEG || isWEBP);
      };

      reader.onerror = () => resolve(false);
    });
  }


  private showImageError(event: any, message: string) {
    this.errorMessage = message;
    this.openErrorPopup();

    event.target.value = '';
    this.selectedFile = null as any;
    this.selectedImage = null;
  }


  openErrorPopup() {
    this.isErrorPopupOpen = true;
  }

  closeErrorPopup() {
    this.isErrorPopupOpen = false;
    this.errorMessage = null;
  }
  selectedRecord: any = null;
 
  openPopup(record: any) {
    this.selectedRecord = record;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.selectedRecord = null;
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

        this.toastr.success(
          'Profile updated successfully',
          'Success'
        );
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(
          err.error || 'Failed to update profile',
          'Error'
        );
      },
    });
  },
  error: (err) => {
    console.log(err);
    this.toastr.error(
      err.error || 'Failed to update user',
      'Error'
    );
  },
});
  }

  medicalRecords: any[] = [];

  loadMedicalRecords() {
  const patientId = this.profileData.profile._id;

  this.profileService.getMedicalRecords(patientId).subscribe({
    next: (res: any) => {
      console.log(res);
      this.medicalRecords = res;
      this.groupRecordsByDoctor();
    },
    error: (err) => {
      console.log(err);
    }
  });
}
  groupedRecords: any[] = [];

groupRecordsByDoctor() {
  const groups = new Map<string, any>();

  this.medicalRecords.forEach((record: any) => {
    const doctorId = record.doctorId?._id?._id || record.doctorId?._id;
    const doctorName = record.doctorId?._id?.name;

    if (!groups.has(doctorId)) {
      groups.set(doctorId, {
        doctorId,
        doctorName,
        isOpen: false,
        visits: []
      });
    }
    groups.get(doctorId).visits.push(record);
  });

  this.groupedRecords = Array.from(groups.values());
}

toggleDropdown(group: any) {
  group.isOpen = !group.isOpen;
}
}
