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

  // Popup
  isPopupOpen = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.profileData = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

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
}
