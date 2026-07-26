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
  limit = 5;
  totalPages = 1;
  doctors: any[] = [];
  specialties: any[] = [];
  isModalOpen = false;
  selectedDoctor: any = null;
  selectedClinic: any = null;
  profileData: any;
  appointmentDate = '';
  appointmentTime = '';
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

  openModal(doctor: any, clinic: any) {
    this.selectedDoctor = doctor;
    this.selectedClinic = clinic;
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
    console.log('Loading...', {
      page: this.page,
      search: this.search,
    });
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
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.page = page;
    this.loadDoctors();
  }
  onFilterChange() {
    this.page = 1;
    this.loadDoctors();
  }
  bookAppointment() {
    const body = {
      doctorId: this.selectedDoctor._id._id,
      clinicId: this.selectedClinic.clinicId._id,

      date: this.appointmentDate,

      startTime: this.appointmentTime,

      paymentMethod: 'cash',
    };
console.log({
  date: this.appointmentDate,
  startTime: this.appointmentTime,
});
    this.appointmentService.bookAppointment(body).subscribe({
      next: (res) => {
        console.log(res);

        this.closeModal();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
