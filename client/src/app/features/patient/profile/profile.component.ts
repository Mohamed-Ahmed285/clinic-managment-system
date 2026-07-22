import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileData: any;

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

  selectedImage: string | ArrayBuffer | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result;
    };

    reader.readAsDataURL(file);
  }
}
