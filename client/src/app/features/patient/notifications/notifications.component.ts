import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationService } from 'src/app/core/services/notification.service';
import {
  NotificationPush,
  RealtimeNotificationsService
} from 'src/app/core/services/realtime-notifications.service';

export interface NotificationView {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;

  icon: string;
  iconWrap: string;
  iconColor: string;
}

interface IconStyle {
  icon: string;
  iconWrap: string;
  iconColor: string;
}

const DEFAULT_ICON: IconStyle = {
  icon: 'fa-bell',
  iconWrap: 'bg-secondary',
  iconColor: 'text-primary'
};

const ICONS: { [type: string]: IconStyle } = {
  appointmentBooked: {
    icon: 'fa-calendar-check',
    iconWrap: 'bg-secondary',
    iconColor: 'text-primary'
  },
  appointmentCancelled: {
    icon: 'fa-circle-xmark',
    iconWrap: 'bg-red-100',
    iconColor: 'text-red-500'
  },
  appointmentReminder: DEFAULT_ICON,
  MedicalReminder: {
    icon: 'fa-pills',
    iconWrap: 'bg-secondary',
    iconColor: 'text-primary'
  },
  reviewReceived: {
    icon: 'fa-star',
    iconWrap: 'bg-secondary',
    iconColor: 'text-primary'
  },
  system: DEFAULT_ICON
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notifications: NotificationView[] = [];
  loading = true;
  error: string | null = null;

  private readonly subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private realtime: RealtimeNotificationsService
  ) {}

  ngOnInit(): void {
    this.load();

    this.realtime.connect();

    this.subscriptions.add(
      this.realtime.notifications$.subscribe(push => this.prepend(push))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.realtime.disconnect();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.notificationService.getMyNotifications().subscribe({
      next: items => {
        this.notifications = items.map(item => this.toView(item));
        this.loading = false;
      },
      error: () => {
        this.error =
          'We could not load your notifications. Please try again.';
        this.loading = false;
      }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(note: NotificationView): void {
    if (note.isRead) {
      return;
    }

    this.notificationService.markAsRead(note._id).subscribe({
      next: () => {
        note.isRead = true;
      },
      error: () => {
        // Leave the row unread; nothing was changed locally.
      }
    });
  }

  remove(note: NotificationView): void {
    this.notificationService.deleteNotification(note._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          n => n._id !== note._id
        );
      },
      error: () => {
        // Leave the row in place; nothing was changed locally.
      }
    });
  }

  trackById(_index: number, note: NotificationView): string {
    return note._id;
  }

  timeAgo(iso: string): string {
    const then = new Date(iso).getTime();

    if (isNaN(then)) {
      return '';
    }

    const elapsed = Date.now() - then;

    if (elapsed < MINUTE) {
      return 'Just now';
    }

    if (elapsed < HOUR) {
      const minutes = Math.floor(elapsed / MINUTE);
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    if (elapsed < DAY) {
      const hours = Math.floor(elapsed / HOUR);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    const days = Math.floor(elapsed / DAY);

    if (days < 2) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return new Date(iso).toLocaleDateString();
  }

  private prepend(push: NotificationPush): void {
    const alreadyPresent = this.notifications.some(n => n._id === push._id);

    if (alreadyPresent) {
      return;
    }

    this.notifications = [this.toView(push), ...this.notifications];
  }

  private toView(source: NotificationPush): NotificationView {
    const style = ICONS[source.type] || DEFAULT_ICON;

    return {
      _id: source._id,
      title: source.title,
      message: source.message,
      type: source.type,
      isRead: source.isRead,
      createdAt: source.createdAt,
      icon: style.icon,
      iconWrap: style.iconWrap,
      iconColor: style.iconColor
    };
  }
}
