import { Component, OnInit } from '@angular/core';
import { Appointment, NotificationItem, PanelStat, RatingSummary } from '../models/dashboard.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DoctorService, DashboardResponse } from 'src/app/core/services/doctor.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  todayLabel = 'Today';
  
dashboard: DashboardResponse | null = null;  

  appointments: Appointment[] = [];

  panelStats: PanelStat[] = [];

  ratingSummary: RatingSummary = {
    averageRating: 0,
    maxRating: 5,
    ratingCount: 0,
    eligiblePatients: 0
  };

  notifications: NotificationItem[] = [
   ];

constructor(
  private doctorService: DoctorService,
  private notificationService: NotificationService
) {}
  ngOnInit(): void {
    this.loadDashboard();
    this.loadNotifications();
  }

  loadDashboard(): void {

    this.doctorService.getDashboard().subscribe({


      next: (res) => {

        this.dashboard = res;

        this.appointments = res.todayAppointments.map((item: any) => ({
        id: item._id,
        time: item.startTime,
        patientName:
         item.patientId?.name ??
        item.patientId?._id?.name ??
        'Unknown Patient',
        visitType: item.clinicId?.name ?? 'Clinic Visit',
        status: this.mapStatus(item.status)
}));

        this.panelStats = [
          {
            label: 'Active patients',
            value: res.stats.activePatients.toString()
          },
          {
            label: 'Duration time',
            value: `${res.stats.appointmentDuration} min`
          },
          {
            label: 'Total appointments',
            value: res.stats.totalAppointments.toString()
          },
          {
            label: 'Completed appointments',
            value: res.stats.completedAppointments.toString()
          }
        ];

        this.ratingSummary = {
          averageRating: res.doctor.rating.average,
          maxRating: 5,
          ratingCount: res.doctor.rating.count,
          eligiblePatients: res.stats.activePatients
        };

      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  mapStatus(status: string): Appointment['status'] {

    switch (status) {

      case 'pending':
        return 'Waiting';

      case 'confirmed':
        return 'Upcoming';

      case 'completed':
        return 'Completed';

      case 'cancelled':
        return 'Completed';

      default:
        return 'Upcoming';
    }

  }

  loadNotifications(): void {

  this.notificationService.getMyNotifications().subscribe({

    next: (res) => {

      this.notifications = res.map(item => ({
        id: item._id,
        senderName: item.recipientType,
        subject: item.title,
        preview: item.message,
        timeAgo: new Date(item.createdAt).toLocaleString(),
        read: item.isRead
      }));
  console.log("Notifications:", this.notifications);
    },

    error: (err) => {
      console.error(err);
    }

  });

}
}
