import { Component, Input } from '@angular/core';
import { NotificationItem } from '../models/dashboard.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
  @Input() notifications: NotificationItem[] = [];
}
