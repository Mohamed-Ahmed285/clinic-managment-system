import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AppointmentService } from 'src/app/core/services/appointments.service';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  availableTimes: string[] = [];
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
  minDate = '';
  maxDate = '';
  selectedAvailability: any[] = [];
  appointments: any[] = [];
  nextAppointment: any;
  upcomingAppointments: any[] = [];
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
    this.loadMyAppointments();

    const today = new Date();

    this.minDate = today.toISOString().split('T')[0];

    const afterSixMonths = new Date();
    afterSixMonths.setMonth(afterSixMonths.getMonth() + 6);

    this.maxDate = afterSixMonths.toISOString().split('T')[0];
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
  generateAvailableTimes(startHour: string, endHour: string, duration: number) {
    this.availableTimes = [];

    let [startH, startM] = startHour.split(':').map(Number);
    const [endH, endM] = endHour.split(':').map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current < end) {
      const h = Math.floor(current / 60);
      const m = current % 60;

      this.availableTimes.push(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      );

      current += duration;
    }
  }
  openModal(doctor: any, clinic: any) {
    console.log(clinic);
    console.log(doctor);
    this.selectedDoctor = doctor;
    this.selectedClinic = clinic;
    this.selectedAvailability = clinic.availability;
    this.generateAvailableTimes(
      clinic.clinicId.startHour,
      clinic.clinicId.endHour,
      doctor.appointmentDurationMinutes,
    );
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
        if (err.error === 'appointment time is outside clinic working hours') {
          alert('Please choose a time within the doctors working hours.');
        } else {
          alert(err.error);
        }
      },
    });
  }
  loadMyAppointments() {
    this.appointmentService.getMyAppointments().subscribe({
      next: (res: any) => {
        console.log(res);

        this.appointments = res;

        const today = new Date();

        this.upcomingAppointments = this.appointments
          .filter(
            (appointment: any) =>
              appointment.status !== 'cancelled' &&
              new Date(appointment.date) >= today,
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        console.log(this.upcomingAppointments.length);
      },
      error: (err) => console.log(err),
    });
  }
}
