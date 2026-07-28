import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { NotificationsComponent } from './notifications.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  NotificationPush,
  RealtimeNotificationsService
} from 'src/app/core/services/realtime-notifications.service';
import { environment } from 'src/environments/environment';

class StubRealtimeNotificationsService {
  readonly pushes = new Subject<NotificationPush>();
  readonly notifications$ = this.pushes.asObservable();
  connected = false;

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }
}

const makePush = (over: Partial<NotificationPush> = {}): NotificationPush => ({
  _id: 'n1',
  title: 'Appointment Confirmed',
  message: 'Your appointment has been booked successfully.',
  type: 'appointmentBooked',
  isRead: false,
  createdAt: '2026-07-28T09:00:00.000Z',
  ...over
});

describe('Patient NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let http: HttpTestingController;
  let realtime: StubRealtimeNotificationsService;

  const listUrl = `${environment.apiUrl}/notifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [HttpClientTestingModule, SharedModule],
      providers: [
        {
          provide: RealtimeNotificationsService,
          useClass: StubRealtimeNotificationsService
        }
      ]
    });

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    realtime = TestBed.inject(
      RealtimeNotificationsService
    ) as unknown as StubRealtimeNotificationsService;
  });

  afterEach(() => {
    http.verify();
  });

  /** Runs ngOnInit and answers the list request with the given items. */
  const initWith = (items: NotificationPush[]) => {
    fixture.detectChanges();
    http.expectOne(listUrl).flush(items);
    fixture.detectChanges();
  };

  it('loads the notification list on init', () => {
    initWith([makePush()]);

    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0]._id).toBe('n1');
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('shows an error message when the list request fails', () => {
    fixture.detectChanges();
    http.expectOne(listUrl).flush('boom', {
      status: 500,
      statusText: 'Server Error'
    });
    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.notifications).toEqual([]);
  });

  it('reloads when load() is called again after a failure', () => {
    fixture.detectChanges();
    http.expectOne(listUrl).flush('boom', {
      status: 500,
      statusText: 'Server Error'
    });

    component.load();
    http.expectOne(listUrl).flush([makePush()]);

    expect(component.error).toBeNull();
    expect(component.notifications.length).toBe(1);
  });

  it('counts only unread notifications', () => {
    initWith([
      makePush({ _id: 'a', isRead: false }),
      makePush({ _id: 'b', isRead: true }),
      makePush({ _id: 'c', isRead: false })
    ]);

    expect(component.unreadCount).toBe(2);
  });

  it('marks a notification as read', () => {
    initWith([makePush({ _id: 'a', isRead: false })]);

    component.markAsRead(component.notifications[0]);
    http.expectOne(`${listUrl}/a/read`).flush({});

    expect(component.notifications[0].isRead).toBe(true);
    expect(component.unreadCount).toBe(0);
  });

  it('does not call the server for an already-read notification', () => {
    initWith([makePush({ _id: 'a', isRead: true })]);

    component.markAsRead(component.notifications[0]);

    http.expectNone(`${listUrl}/a/read`);
  });

  it('leaves the notification unread when marking fails', () => {
    initWith([makePush({ _id: 'a', isRead: false })]);

    component.markAsRead(component.notifications[0]);
    http.expectOne(`${listUrl}/a/read`).flush('boom', {
      status: 500,
      statusText: 'Server Error'
    });

    expect(component.notifications[0].isRead).toBe(false);
  });

  it('removes a notification on delete', () => {
    initWith([makePush({ _id: 'a' }), makePush({ _id: 'b' })]);

    component.remove(component.notifications[0]);
    http.expectOne(`${listUrl}/a`).flush({});

    expect(component.notifications.map(n => n._id)).toEqual(['b']);
  });

  it('keeps the notification when delete fails', () => {
    initWith([makePush({ _id: 'a' })]);

    component.remove(component.notifications[0]);
    http.expectOne(`${listUrl}/a`).flush('boom', {
      status: 500,
      statusText: 'Server Error'
    });

    expect(component.notifications.length).toBe(1);
  });

  it('prepends a pushed notification', () => {
    initWith([makePush({ _id: 'old' })]);

    realtime.pushes.next(makePush({ _id: 'new' }));
    fixture.detectChanges();

    expect(component.notifications.map(n => n._id)).toEqual(['new', 'old']);
  });

  it('ignores a pushed notification already in the list', () => {
    initWith([makePush({ _id: 'dup' })]);

    realtime.pushes.next(makePush({ _id: 'dup' }));
    fixture.detectChanges();

    expect(component.notifications.length).toBe(1);
  });

  it('connects on init and disconnects on destroy', () => {
    initWith([]);

    expect(realtime.connected).toBe(true);

    fixture.destroy();

    expect(realtime.connected).toBe(false);
  });

  it('stops accepting pushes after destroy', () => {
    initWith([]);
    fixture.destroy();

    realtime.pushes.next(makePush({ _id: 'late' }));

    expect(component.notifications).toEqual([]);
  });

  it('assigns an icon per notification type', () => {
    initWith([
      makePush({ _id: 'a', type: 'appointmentCancelled' }),
      makePush({ _id: 'b', type: 'MedicalReminder' }),
      makePush({ _id: 'c', type: 'somethingUnknown' })
    ]);

    expect(component.notifications[0].icon).toBe('fa-circle-xmark');
    expect(component.notifications[0].iconColor).toBe('text-red-500');
    expect(component.notifications[1].icon).toBe('fa-pills');
    expect(component.notifications[2].icon).toBe('fa-bell');
  });

  describe('timeAgo', () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    it('renders sub-minute ages as "Just now"', () => {
      expect(component.timeAgo(ago(30 * SECOND))).toBe('Just now');
    });

    it('renders minutes, singular and plural', () => {
      expect(component.timeAgo(ago(1 * MINUTE))).toBe('1 minute ago');
      expect(component.timeAgo(ago(5 * MINUTE))).toBe('5 minutes ago');
    });

    it('renders hours, singular and plural', () => {
      expect(component.timeAgo(ago(1 * HOUR))).toBe('1 hour ago');
      expect(component.timeAgo(ago(3 * HOUR))).toBe('3 hours ago');
    });

    it('renders anything within the previous day as "Yesterday"', () => {
      expect(component.timeAgo(ago(25 * HOUR))).toBe('Yesterday');
      expect(component.timeAgo(ago(47 * HOUR))).toBe('Yesterday');
    });

    it('renders days up to a week', () => {
      expect(component.timeAgo(ago(3 * DAY))).toBe('3 days ago');
    });

    it('falls back to a date beyond a week', () => {
      const older = ago(30 * DAY);
      expect(component.timeAgo(older)).toBe(
        new Date(older).toLocaleDateString()
      );
    });

    it('returns an empty string for an unparseable date', () => {
      expect(component.timeAgo('not-a-date')).toBe('');
    });
  });

  it('keeps a notification pushed while the initial fetch is in flight', () => {
    fixture.detectChanges(); // ngOnInit fires, GET pending
    realtime.pushes.next(makePush({ _id: 'pushed' })); // Push arrives before response
    fixture.detectChanges();
    http.expectOne(listUrl).flush([makePush({ _id: 'fetched' })]);
    fixture.detectChanges();

    expect(component.notifications.map(n => n._id)).toEqual(['pushed', 'fetched']);
  });

  it('does not duplicate a notification present in both the push and the fetch', () => {
    fixture.detectChanges(); // ngOnInit fires, GET pending
    realtime.pushes.next(makePush({ _id: 'dup' })); // Push arrives before response
    fixture.detectChanges();
    http.expectOne(listUrl).flush([makePush({ _id: 'dup' })]);
    fixture.detectChanges();

    expect(component.notifications.length).toBe(1);
  });

  it('does not resurrect buffered pushes on a later reload', () => {
    fixture.detectChanges(); // ngOnInit fires, GET pending
    realtime.pushes.next(makePush({ _id: 'ghost' })); // Push arrives before response
    http.expectOne(listUrl).flush([]);
    fixture.detectChanges();

    component.load(); // Reload
    http.expectOne(listUrl).flush([]);
    fixture.detectChanges();

    expect(component.notifications).toEqual([]);
  });

  describe('rendering', () => {
    const testId = (id: string): HTMLElement =>
      fixture.nativeElement.querySelector(`[data-testid="${id}"]`);

    const testIdAll = (id: string) =>
      Array.from<HTMLElement>(
        fixture.nativeElement.querySelectorAll(`[data-testid="${id}"]`)
      );

    it('shows the loader while the request is in flight', () => {
      fixture.detectChanges();

      expect(testId('notifications-loader')).toBeTruthy();

      http.expectOne(listUrl).flush([]);
    });

    it('renders one row per notification', () => {
      initWith([
        makePush({ _id: 'a', title: 'First' }),
        makePush({ _id: 'b', title: 'Second' })
      ]);

      const rows = testIdAll('notification-row');

      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('First');
      expect(rows[1].textContent).toContain('Second');
    });

    it('shows the unread count in the badge', () => {
      initWith([
        makePush({ _id: 'a', isRead: false }),
        makePush({ _id: 'b', isRead: false }),
        makePush({ _id: 'c', isRead: true })
      ]);

      expect(testId('unread-badge').textContent).toContain('2 New');
    });

    it('hides the badge when everything is read', () => {
      initWith([makePush({ _id: 'a', isRead: true })]);

      expect(testId('unread-badge')).toBeNull();
    });

    it('shows the empty state when there are no notifications', () => {
      initWith([]);

      expect(testId('notifications-empty')).toBeTruthy();
      expect(testIdAll('notification-row').length).toBe(0);
    });

    it('shows the error state with a working retry button', () => {
      fixture.detectChanges();
      http.expectOne(listUrl).flush('boom', {
        status: 500,
        statusText: 'Server Error'
      });
      fixture.detectChanges();

      expect(testId('notifications-error')).toBeTruthy();

      testId('notifications-retry').click();
      http.expectOne(listUrl).flush([makePush()]);
      fixture.detectChanges();

      expect(testId('notifications-error')).toBeNull();
      expect(testIdAll('notification-row').length).toBe(1);
    });

    it('offers mark-as-read only on unread rows', () => {
      initWith([
        makePush({ _id: 'a', isRead: false }),
        makePush({ _id: 'b', isRead: true })
      ]);

      expect(testIdAll('mark-read-button').length).toBe(1);
      expect(testIdAll('delete-button').length).toBe(2);
    });

    it('marks a row as read when the check button is clicked', () => {
      initWith([makePush({ _id: 'a', isRead: false })]);

      testId('mark-read-button').click();
      http.expectOne(`${listUrl}/a/read`).flush({});
      fixture.detectChanges();

      expect(testIdAll('mark-read-button').length).toBe(0);
      expect(testId('unread-badge')).toBeNull();
    });

    it('removes a row when the delete button is clicked', () => {
      initWith([makePush({ _id: 'a' }), makePush({ _id: 'b' })]);

      testIdAll('delete-button')[0].click();
      http.expectOne(`${listUrl}/a`).flush({});
      fixture.detectChanges();

      expect(testIdAll('notification-row').length).toBe(1);
    });

    it('renders a pushed notification at the top of the list', () => {
      initWith([makePush({ _id: 'old', title: 'Older' })]);

      realtime.pushes.next(makePush({ _id: 'new', title: 'Newer' }));
      fixture.detectChanges();

      const rows = testIdAll('notification-row');

      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('Newer');
    });
  });
});
