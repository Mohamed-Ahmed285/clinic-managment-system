import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReviewService } from 'src/app/core/services/review.service';
import { AppointmentService } from 'src/app/core/services/appointments.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmPopUpComponent } from 'src/app/shared/components/confirm-pop-up/confirm-pop-up.component';
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  showConfirm = false;

  reviews: any[] = [];

  appointments: any[] = [];

  // Appointments the patient is still allowed to review
  reviewableAppointments: any[] = [];

  showModal = false;
  isEditing = false;
  selectedReviewId = '';

  // Appointment shown as read only text while editing an existing review
  editedAppointment: any = null;

  newReview = {
    appointmentId: '',
    rating: 5,
    comment: '',
  };

  constructor(
    private reviewService: ReviewService,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }
  openConfirm(id: string): void {
    this.selectedReviewId = id;
    this.showConfirm = true;
  }
  loadReviews(): void {
    forkJoin({
      reviews: this.reviewService.getMyReviews(),
      appointments: this.appointmentService.getMyAppointments(),
    }).subscribe({
      next: ({ reviews, appointments }) => {
        this.reviews = reviews;
        this.appointments = appointments as any[];
        this.buildReviewableAppointments();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // Only confirmed or completed appointments that have no review yet can be reviewed
  buildReviewableAppointments(): void {
    const reviewedIds = new Set(
      this.reviews.map((review) => this.getAppointmentId(review.appointmentId)),
    );

    this.reviewableAppointments = this.appointments.filter(
      (appointment) =>
        ['confirmed', 'completed'].includes(appointment.status) &&
        !reviewedIds.has(appointment._id),
    );
  }

  // appointmentId comes back as a plain id, but stay safe if it is ever populated
  getAppointmentId(appointmentId: any): string {
    return typeof appointmentId === 'object' && appointmentId
      ? appointmentId._id
      : appointmentId;
  }

  appointmentLabel(appointment: any): string {
    const doctor = appointment.doctorId?._id?.name || 'Doctor';

    const specialty = appointment.doctorId?.specialtyId?.name;

    const date = new Date(appointment.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const label = `Dr. ${doctor}${specialty ? ' (' + specialty + ')' : ''} — ${date}`;

    return appointment.startTime
      ? `${label} at ${appointment.startTime}`
      : label;
  }

  openModal(): void {
    this.isEditing = false;

    this.selectedReviewId = '';

    this.editedAppointment = null;

    this.newReview = {
      appointmentId: '',
      rating: 5,
      comment: '',
    };

    this.showModal = true;
  }

  editReview(review: any): void {
    this.isEditing = true;

    this.showModal = true;

    this.selectedReviewId = review._id;

    const appointmentId = this.getAppointmentId(review.appointmentId);

    this.editedAppointment =
      this.appointments.find(
        (appointment) => appointment._id === appointmentId,
      ) || null;

    this.newReview = {
      appointmentId: appointmentId,
      rating: review.rating,
      comment: review.comment,
    };
  }

  closeModal(): void {
    this.showModal = false;

    this.isEditing = false;

    this.selectedReviewId = '';

    this.editedAppointment = null;

    this.newReview = {
      appointmentId: '',
      rating: 5,
      comment: '',
    };
  }

  submitReview(): void {
    if (this.isEditing) {
      this.reviewService
        .updateReview(this.selectedReviewId, {
          rating: this.newReview.rating,
          comment: this.newReview.comment,
        })
        .subscribe({
          next: () => {
            this.toastr.success('Review updated successfully!', 'Success');

            this.closeModal();

            this.loadReviews();
          },

          error: (err) => {
            console.error(err);

            this.toastr.error('Failed to update review successfully!', 'Error');
          },
        });
    } else {
      if (!this.newReview.appointmentId) {
        this.toastr.success('Pleace select an appointment!', 'Success');

        return;
      }

      this.reviewService.createReview(this.newReview).subscribe({
        next: () => {
          this.toastr.success('Review added successfully!', 'Success');

          this.closeModal();

          this.loadReviews();
        },

        error: (err) => {
          console.error(err);

          this.toastr.error('Failed to add Review!', 'Error');
        },
      });
    }
  }

  deleteReview(id: string): void {
    // const confirmed = confirm('Are you sure you want to delete this review?');

    // if (!confirmed) {
    //   return;
    // }

    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.showConfirm = false;
        this.selectedReviewId = '';
        this.toastr.success('Review Deleted successfully!', 'Success');

        this.loadReviews();
      },

      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to delete review!', 'Error');
      },
    });
  }
}
