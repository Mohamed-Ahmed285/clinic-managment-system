import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Appointment, NotificationItem, PanelStat, RatingSummary } from '../models/dashboard.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DoctorService, DashboardResponse } from 'src/app/core/services/doctor.service';
import { RealtimeNotificationsService } from 'src/app/core/services/realtime-notifications.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

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

   loadingDashboard = true;

  // holds the socket subscription so we can clean it up in ngOnDestroy
  private notificationSub?: Subscription;

constructor(
  private doctorService: DoctorService,
  private notificationService: NotificationService,
  private realtimeNotifications: RealtimeNotificationsService
) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadNotifications();

    // open the socket connection and join this doctor's room
    this.realtimeNotifications.connect();

    // whenever a new notification is pushed from the server, just re-fetch
    // the full, filtered, correctly-ordered list from the REST endpoint
    // instead of trying to hand-merge the partial socket payload
    this.notificationSub = this.realtimeNotifications.notifications$.subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.realtimeNotifications.disconnect();
  }

loadDashboard(): void {

  this.loadingDashboard = true;

  this.doctorService.getDashboard().subscribe({

    next: (res) => {

      this.dashboard = res;

      this.appointments = res.todayAppointments.map((item: any) => ({
        id: item._id,
        time: this.formatTime(item.startTime),
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

      this.loadingDashboard = false;
    },

    error: (err) => {
      console.error(err);
      this.loadingDashboard = false;
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

formatTime(time: string): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}


  loadNotifications(): void {

  this.notificationService.getMyNotifications().subscribe({

    next: (res) => {

      this.notifications = res
        .filter(item => Boolean(item.relatedAppointmentId))
        .map(item => ({
        id: item._id,
        senderName: item.recipientType,
        subject: item.title,
        preview: item.message,
        timeAgo: new Date(item.createdAt).toLocaleString()
      }));
  console.log("Notifications:", this.notifications);
    },

    error: (err) => {
      console.error(err);
    }

  });

}
}