import { Component, Input } from '@angular/core';
import { NotificationItem } from '../models/dashboard.model';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

  @Input() notifications: NotificationItem[] = [];

  constructor(private notificationService: NotificationService) {}

  dismiss(id: string): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      const index = this.notifications.findIndex(note => note.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    });
  }

  get visibleNotifications(): NotificationItem[] {
    return this.notifications.slice(0, 10);
  }

toggleDetails(note: NotificationItem) {
  console.log("clicked", note);

  if (note.expanded) {
    note.expanded = false;
    return;
  }

  if (note.appointmentDetails) {
    note.expanded = true;
    return;
  }

  this.notificationService
      .getAppointmentDetails(note.id)
      .subscribe(res => {

        note.appointmentDetails = res;
        note.expanded = true;

      });

}
}
