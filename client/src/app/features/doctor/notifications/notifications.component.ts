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

  markAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe(() => {
      const notification = this.notifications.find(n => n.id === id);

      if (notification) {
        notification.read = true;
      }
    });
  }
  get unreadNotifications(): NotificationItem[] {
  return this.notifications.filter(n => !n.read);
}

get readNotifications(): NotificationItem[] {
  return this.notifications.filter(n => n.read);
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
