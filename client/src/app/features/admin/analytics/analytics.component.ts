import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  overview: any = null;
  appointmentStats: any = null;
  doctorStats: any = null;
  specialtyStats: any[] = [];
  doctorPerformance: any[] = [];
  loading = true;

  selectedSection = 'overview';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {

    this.analyticsService.getOverview().subscribe({
      next: (res) => this.overview = res.data
    });

    this.analyticsService.getAppointmentStats().subscribe({
      next: (res) => this.appointmentStats = res.data
    });

    this.analyticsService.getDoctorStats().subscribe({
      next: (res) => this.doctorStats = res.data
    });

    this.analyticsService.getSpecialtyStats().subscribe({
      next: (res) => this.specialtyStats = res.data
    });

    this.analyticsService.getDoctorPerformance().subscribe({
      next: (res) => {
        this.doctorPerformance = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

  }

  showSection(section: string): void {
    this.selectedSection = section;
  }

}