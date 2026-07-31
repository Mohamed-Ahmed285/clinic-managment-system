import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from '../services/appointment.service';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  allAppointments: any[] = [];
  appointments: any[] = [];
  loading = true;
  activeFilter = '';
  searchTerm = '';
  selectedAppointmentId = '';
  showCancelModal = false;
  statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  openCancelModal(id: string) {
    this.selectedAppointmentId = id;
    this.showCancelModal = true;
  }
  closeCancelModal() {
    this.showCancelModal = false;
  }
  confirmCancel(reason: string) {
    this.cancelAppointment(this.selectedAppointmentId, reason);
  }
  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (response) => {
        console.log('Appointments response:', response);
        this.allAppointments = response;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Could not load appointments', 'Error');
        this.loading = false;
      },
    });
  }

  // count of appointments per status, for the stat cards
  countByStatus(status: string): number {
    return this.allAppointments.filter((a) => a.status === status).length;
  }

  applyFilter(): void {
    let result = this.activeFilter
      ? this.allAppointments.filter((a) => a.status === this.activeFilter)
      : this.allAppointments;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();

      result = result.filter((a) => {
        const patient = a.patientId?._id?.name?.toLowerCase() ?? '';
        const doctor = a.doctorId?._id?.name?.toLowerCase() ?? '';
        const clinic = a.clinicId?.name?.toLowerCase() ?? '';

        return (
          patient.includes(term) ||
          doctor.includes(term) ||
          clinic.includes(term)
        );
      });
    }

    this.appointments = result;
    this.currentPage = 1;
  }

  // ---- Pagination----

  get totalPages(): number {
    return Math.ceil(this.appointments.length / this.itemsPerPage) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedAppointments(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.appointments.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  filterByStatus(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  cancelAppointment(id: string,reason:string): void {
    // const reason = prompt('Reason for cancellation:');
    // if (reason === null) return;
    this.appointmentService.cancel(id, reason).subscribe({
      next: () => {
        this.showCancelModal = false;
        this.loadAppointments();
        this.toastr.success('Appointment cancelled', 'Success');
      },
      error: () => {
        this.toastr.error('Could not cancel appointment', 'Error');
      },
    });
  }

  completeAppointment(id: string): void {
    this.appointmentService.complete(id).subscribe({
      next: () => {
        this.loadAppointments();
        this.toastr.success('Appointment marked as completed', 'Success');
      },
      error: () => {
        this.toastr.error('Could not complete appointment', 'Error');
      },
    });
  }
}
