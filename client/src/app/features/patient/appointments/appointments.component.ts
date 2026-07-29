import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AppointmentService } from 'src/app/core/services/appointments.service';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ActivatedRoute } from '@angular/router';
import { FavoriteService } from 'src/app/core/services/favorite.service';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  Math = Math;
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
  favoriteIds = new Set<string>();
  pendingFavoriteIds = new Set<string>();
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
    private toastr: ToastrService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private favoriteService: FavoriteService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadSpecialties();
    this.loadDoctors();
    this.loadMyAppointments();
   this.route.queryParams.subscribe((params) => {
  if (params['payment'] === 'success') {
    this.toastr.success('Payment Successful', 'Success');
    this.loadMyAppointments();
  }

  if (params['payment'] === 'failed') {
    this.toastr.error('Payment Failed', 'Error');
  }
});
    this.loadFavorites();

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
  loadFavorites() {
    this.favoriteService.getMyFavorites().subscribe({
      next: (res: any) => {
        this.favoriteIds = new Set(
          (res || []).map((favorite: any) => this.getDoctorId(favorite)),
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getDoctorId(doctor: any): string {
    return doctor?._id?._id || doctor?._id;
  }
  isFavorite(doctor: any): boolean {
    return this.favoriteIds.has(this.getDoctorId(doctor));
  }
  isFavoritePending(doctor: any): boolean {
    return this.pendingFavoriteIds.has(this.getDoctorId(doctor));
  }
  toggleFavorite(doctor: any) {
    const doctorId = this.getDoctorId(doctor);

    if (!doctorId || this.pendingFavoriteIds.has(doctorId)) return;

    const wasFavorite = this.favoriteIds.has(doctorId);

    const request = wasFavorite
      ? this.favoriteService.removeFavorite(doctorId)
      : this.favoriteService.addFavorite(doctorId);

    this.pendingFavoriteIds.add(doctorId);

    request.subscribe({
      next: () => {
        if (wasFavorite) {
          this.favoriteIds.delete(doctorId);
        } else {
          this.favoriteIds.add(doctorId);
        }

        this.pendingFavoriteIds.delete(doctorId);
      },
      error: (err) => {
        console.log(err);

        this.pendingFavoriteIds.delete(doctorId);

        alert(err.error);
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

     paymentMethod: this.profileData.profile.preferredPaymentMethod,
    };
    console.log({
      date: this.appointmentDate,
      startTime: this.appointmentTime,
    });
    this.appointmentService.bookAppointment(body).subscribe({
      next: (res: any) => {
        if (this.profileData.profile.preferredPaymentMethod === 'online') {
          this.paymentService.checkout(res._id).subscribe({
            next: (payment: any) => {
              window.location.href = payment.url;
            },
            error: (err) => {
              console.log(err);
              this.handleError('Failed to start payment.');
            },
          });
        } else {
          this.closeModal();
          this.loadMyAppointments();
        }
      },
      error: (err) => {
        if (err.error?.includes('E11000')) {
          this.handleError('This appointment has already been booked.');
        } else if (
          err.error === 'appointment time is outside clinic working hours'
        ) {
          this.handleError(
            "Please choose a time within the doctor's working hours.",
          );
        } else {
          this.handleError(err.error);
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
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  cancelAppointment(id: string) {
    const body = {
      cancellationReason: 'Cancelled by patient',
    };

    this.appointmentService.cancelAppointment(id, body).subscribe({
      next: (res) => {
        console.log(res);

        this.loadMyAppointments();
        this.testToast();
      },
      error: (err) => {
        console.log(err);
        this.handleError(err.error)
      },
    });
  }
  showErrorModal = false;
  errorMessage = '';

  handleError(error: any) {
    console.log('HANDLE ERROR CALLED');

    this.errorMessage =
      error?.message || error || 'Something went wrong. Please try again.';

    this.showErrorModal = true;

    console.log(this.showErrorModal, this.errorMessage);
  }
  showCancelModal = false;
  selectedAppointmentId = '';

  openCancelModal(id: string) {
    this.selectedAppointmentId = id;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
  }
  testToast() {
    this.toastr.success('Appointment cancelled!', 'Success');
  }
  payAppointment(appointmentId: string) {
  this.paymentService.checkout(appointmentId).subscribe({
    next: (res: any) => {
      window.location.href = res.url;
    },
    error: (err) => {
      console.error(err);
      this.handleError('Unable to start payment.');
    }
  });
}
}
