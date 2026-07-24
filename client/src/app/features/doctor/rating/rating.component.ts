import { Component, Input } from '@angular/core';
import { RatingSummary } from '../models/dashboard.model';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent {
  @Input() rating!: RatingSummary;

  get averageRatingPercent(): number {
    if (!this.rating || !this.rating.maxRating) {
      return 0;
    }
    return Math.round((this.rating.averageRating / this.rating.maxRating) * 100);
  }

  get ratingCountPercent(): number {
    if (!this.rating || !this.rating.eligiblePatients) {
      return 0;
    }
    return Math.round((this.rating.ratingCount / this.rating.eligiblePatients) * 100);
  }
}
