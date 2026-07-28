import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReviewService } from 'src/app/core/services/review.service';
import { AppointmentService } from 'src/app/core/services/appointments.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

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
    comment: ''
  };

  constructor(
    private reviewService: ReviewService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    forkJoin({
      reviews: this.reviewService.getMyReviews(),
      appointments: this.appointmentService.getMyAppointments()
    }).subscribe({
      next: ({ reviews, appointments }) => {
        this.reviews = reviews;
        this.appointments = appointments as any[];
        this.buildReviewableAppointments();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Only confirmed or completed appointments that have no review yet can be reviewed
  buildReviewableAppointments(): void {

    const reviewedIds = new Set(
      this.reviews.map((review) => this.getAppointmentId(review.appointmentId))
    );

    this.reviewableAppointments = this.appointments.filter((appointment) =>
      ['confirmed', 'completed'].includes(appointment.status) &&
      !reviewedIds.has(appointment._id)
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
      year: 'numeric'
    });

    const label = `Dr. ${doctor}${specialty ? ' (' + specialty + ')' : ''} — ${date}`;

    return appointment.startTime ? `${label} at ${appointment.startTime}` : label;

  }

  openModal(): void {

    this.isEditing = false;

    this.selectedReviewId = '';

    this.editedAppointment = null;

    this.newReview = {
      appointmentId: '',
      rating: 5,
      comment: ''
    };

    this.showModal = true;
  }

  editReview(review: any): void {

    this.isEditing = true;

    this.showModal = true;

    this.selectedReviewId = review._id;

    const appointmentId = this.getAppointmentId(review.appointmentId);

    this.editedAppointment = this.appointments.find(
      (appointment) => appointment._id === appointmentId
    ) || null;

    this.newReview = {
      appointmentId: appointmentId,
      rating: review.rating,
      comment: review.comment
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
      comment: ''
    };

  }

  submitReview(): void {

    if (this.isEditing) {

      this.reviewService.updateReview(
        this.selectedReviewId,
        {
          rating: this.newReview.rating,
          comment: this.newReview.comment
        }
      ).subscribe({

        next: () => {

          alert('Review updated successfully');

          this.closeModal();

          this.loadReviews();

        },

        error: (err) => {

          console.error(err);

          alert(err.error || 'Failed to update review');

        }

      });

    }

    else {

      if (!this.newReview.appointmentId) {

        alert('Please select an appointment');

        return;

      }

      this.reviewService.createReview(this.newReview).subscribe({

        next: () => {

          alert('Review added successfully');

          this.closeModal();

          this.loadReviews();

        },

        error: (err) => {

          console.error(err);

          alert(err.error || 'Failed to add review');

        }

      });

    }

  }

  deleteReview(id: string): void {

    const confirmed = confirm('Are you sure you want to delete this review?');

    if (!confirmed) {
      return;
    }

    this.reviewService.deleteReview(id).subscribe({

      next: () => {

        alert('Review deleted successfully');

        this.loadReviews();

      },

      error: (err) => {

        console.error(err);

        alert(err.error || 'Failed to delete review');

      }

    });

  }

}
