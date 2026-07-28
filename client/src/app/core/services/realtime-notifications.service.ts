import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

/**
 * The payload the server pushes over socket.io. This is deliberately narrower
 * than the stored document — the server sends only these six fields (see
 * server/services/notificationService.js), with no recipientId,
 * relatedAppointmentId or updatedAt.
 */
export interface NotificationPush {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeNotificationsService implements OnDestroy {

  private socket: Socket | null = null;
  private readonly pushes = new Subject<NotificationPush>();

  readonly notifications$: Observable<NotificationPush> =
    this.pushes.asObservable();

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket) {
      return;
    }

    const user = this.authService.getUser();

    if (!user || !user.id) {
      return;
    }

    const userId = String(user.id);
    const socket = this.createSocket(environment.apiUrl);
    this.socket = socket;

    // Must run on every connect, not once at setup: socket.io reconnects
    // automatically and room membership does not survive a reconnect.
    socket.on('connect', () => {
      socket.emit('joinRoom', userId);
    });

    socket.on('notification', (payload: NotificationPush) => {
      this.pushes.next(payload);
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.off('notification');
    this.socket.off('connect');
    this.socket.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.pushes.complete();
  }

  /**
   * Seam for tests. Overridden by a subclass so specs never open a real socket.
   */
  protected createSocket(url: string): Socket {
    return io(url);
  }
}
