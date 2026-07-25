import { Component, Input } from '@angular/core';
import { RatingSummary } from '../models/dashboard.model';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent {
  @Input() rating!: RatingSummary;
}