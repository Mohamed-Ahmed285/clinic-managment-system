import { Component, OnInit } from '@angular/core';
import { ReviewService } from 'src/app/core/services/review.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  reviews: any[] = [];

  showModal = false;
  isEditing = false;
  selectedReviewId = '';

  newReview = {
    appointmentId: '',
    rating: 5,
    comment: ''
  };

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getMyReviews().subscribe({
      next: (res) => {
        console.log('Reviews:', res);
        this.reviews = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openModal(): void {

    this.isEditing = false;

    this.selectedReviewId = '';

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

    this.newReview = {
      appointmentId: review.appointmentId,
      rating: review.rating,
      comment: review.comment
    };

  }

  closeModal(): void {

    this.showModal = false;

    this.isEditing = false;

    this.selectedReviewId = '';

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

        alert('Please enter Appointment ID');

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
