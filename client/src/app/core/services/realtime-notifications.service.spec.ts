import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';
import {
  NotificationPush,
  RealtimeNotificationsService
} from './realtime-notifications.service';

/**
 * Stands in for a socket.io Socket. Records what was emitted and lets a test
 * fire server-side events by hand.
 */
class FakeSocket {
  handlers: { [event: string]: (payload?: any) => void } = {};
  emitted: Array<{ event: string; payload: any }> = [];
  disconnected = false;

  on(event: string, cb: (payload?: any) => void): this {
    this.handlers[event] = cb;
    return this;
  }

  off(event: string): this {
    delete this.handlers[event];
    return this;
  }

  emit(event: string, payload?: any): this {
    this.emitted.push({ event, payload });
    return this;
  }

  disconnect(): this {
    this.disconnected = true;
    return this;
  }

  /** Simulate the server sending an event to this client. */
  fire(event: string, payload?: any): void {
    const handler = this.handlers[event];
    if (handler) {
      handler(payload);
    }
  }
}

/**
 * Overrides the socket seam so no real connection is opened.
 *
 * The `@Injectable()` is required: this subclass declares no constructor of
 * its own, so Angular must be told to reuse the parent's injection metadata.
 * Without it, `useClass` fails to resolve `AuthService`.
 */
@Injectable()
class TestableRealtimeNotificationsService extends RealtimeNotificationsService {
  readonly fake = new FakeSocket();
  createdCount = 0;

  protected override createSocket(_url: string): any {
    this.createdCount++;
    return this.fake;
  }
}

const samplePush: NotificationPush = {
  _id: 'n1',
  title: 'Appointment Confirmed',
  message: 'Your appointment has been booked successfully.',
  type: 'appointmentBooked',
  isRead: false,
  createdAt: '2026-07-28T09:00:00.000Z'
};

describe('RealtimeNotificationsService', () => {
  let service: TestableRealtimeNotificationsService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: RealtimeNotificationsService,
          useClass: TestableRealtimeNotificationsService
        }
      ]
    });

    authService = TestBed.inject(AuthService);
    service = TestBed.inject(
      RealtimeNotificationsService
    ) as TestableRealtimeNotificationsService;
  });

  it('does not open a socket when nobody is signed in', () => {
    spyOn(authService, 'getUser').and.returnValue(null);

    service.connect();

    expect(service.createdCount).toBe(0);
  });

  it('joins the room named after the user id once connected', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    service.connect();
    service.fake.fire('connect');

    expect(service.fake.emitted).toEqual([
      { event: 'joinRoom', payload: 'user-123' }
    ]);
  });

  it('rejoins the room on every reconnect, not just the first connect', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    service.connect();
    service.fake.fire('connect');
    service.fake.fire('connect'); // socket.io reconnected after a dropout

    expect(service.fake.emitted.length).toBe(2);
    expect(service.fake.emitted[1]).toEqual({
      event: 'joinRoom',
      payload: 'user-123'
    });
  });

  it('emits pushed notifications on notifications$', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    const received: NotificationPush[] = [];
    service.notifications$.subscribe(n => received.push(n));

    service.connect();
    service.fake.fire('notification', samplePush);

    expect(received).toEqual([samplePush]);
  });

  it('is idempotent — calling connect twice opens one socket', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    service.connect();
    service.connect();

    expect(service.createdCount).toBe(1);
  });

  it('disconnects the socket and allows a later reconnect', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    service.connect();
    service.disconnect();

    expect(service.fake.disconnected).toBe(true);

    service.connect();

    expect(service.createdCount).toBe(2);
  });

  it('stops emitting after disconnect', () => {
    spyOn(authService, 'getUser').and.returnValue({ id: 'user-123' });

    const received: NotificationPush[] = [];
    service.notifications$.subscribe(n => received.push(n));

    service.connect();
    const socket = service.fake;
    service.disconnect();
    socket.fire('notification', samplePush);

    expect(received).toEqual([]);
  });
});
