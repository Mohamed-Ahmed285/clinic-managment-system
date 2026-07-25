import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AppointmentService } from 'src/app/core/services/appointments.service';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  search = '';
  selectedSpecialty = '';
  selectedState = '';
  page = 1;
  limit = 10;

  doctors: any[] = [];
  totalPages = 0;
  specialties: any[] = [];
  isModalOpen = false;

  profileData: any;
  states: string[] = [
    'Cairo',
    'Giza',
    'Alexandria',
    'Dakahlia',
    'Red Sea',
    'Beheira',
    'Fayoum',
    'Gharbia',
    'Ismailia',
    'Menoufia',
    'Minya',
    'Qalyubia',
    'New Valley',
    'Suez',
    'Aswan',
    'Assiut',
    'Beni Suef',
    'Port Said',
    'Damietta',
    'Sharkia',
    'South Sinai',
    'Kafr El Sheikh',
    'Matrouh',
    'Luxor',
    'Qena',
    'North Sinai',
    'Sohag',
  ];
  constructor(
    private profileService: ProfileService,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadSpecialties();
    this.loadDoctors();
  }

  loadProfile() {
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

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  loadSpecialties() {
    this.appointmentService.getAllSpecialties().subscribe({
      next: (res: any) => {
        console.log(res);
        this.specialties = res.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  // loadDoctors() {
  //   const searchValue = this.search || this.selectedSpecialty;

  //   this.appointmentService
  //     .getDoctors(this.page, this.limit, searchValue)
  //     .subscribe({
  //       next: (res: any) => {
  //          console.log('Doctors Response:', res);
  //         this.doctors = res;
  //         this.totalPages = res.totalPages;
  //       },
  //       error: (err) => console.log(err),
  //     });
  // }
  loadDoctors() {
    this.appointmentService
      .getDoctors(
        this.page,
        this.limit,
        this.search,
        this.selectedSpecialty,
        this.selectedState,
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);

          this.doctors = res.doctors;
          this.totalPages = res.totalPages;
        },
        error: (err) => console.log(err),
      });
  }
}
