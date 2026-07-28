# Patient Notifications Page — Backend Integration

**Date:** 2026-07-28
**Status:** Approved, ready for implementation planning

## Problem

The patient notifications page (`client/src/app/features/patient/notifications/`) is
entirely static. Its template holds four hardcoded cards naming a fictional
"Dr. Ahmed Marwan" and a fixed "4 New" badge; the component class is empty. The
page shows the same thing to every patient regardless of what actually happened
to their appointments.

The backend already serves this data. `GET /notifications` returns the caller's
notifications newest-first, and the server pushes new ones over socket.io as they
are created. Nothing on the client consumes either.

## Goal

Make the patient notifications page render the signed-in patient's real
notifications, update live as new ones arrive, and let the patient mark
individual notifications read or delete them.

## Scope

**In scope**

- Fetch and render the patient's real notifications
- Unread count badge driven by real data
- Mark a single notification as read
- Delete a notification
- Live updates over socket.io

**Out of scope**

- Mark-all-as-read
- The "show appointment details" expander (`GET /notifications/:id/details`)
- The doctor notifications page
- Any server-side change

## What already exists

### Server — no changes required

`server/routes/notification.js`, mounted at `/notifications` in `server/server.js:60`,
all behind `verifyToken`:

| Method | Path                       | Controller                  |
| ------ | -------------------------- | --------------------------- |
| GET    | `/notifications`           | `getMyNotifications`        |
| GET    | `/notifications/:id/details` | `getNotificationAppointment` |
| PUT    | `/notifications/:id/read`  | `markAsRead`                |
| DELETE | `/notifications/:id`       | `deleteNotification`        |

`getMyNotifications` filters on `recipientId: req.user.id`, sorted `createdAt: -1`.

Socket.io is initialised in `server/services/notificationService.js:6`. Clients
emit `joinRoom` with a user id to join a room named after that id; `createNotification`
emits a `notification` event to that room.

### Identity chain — verified

The `recipientId` filter and the socket room name both resolve to the same id as
the JWT subject:

- `models/patient.js:6` — `_id: { type: ObjectId, ref: "user" }`, so a patient
  document shares its primary key with its user document.
- `controllers/user.js:79` — the JWT is signed with `{ id: user._id, role }`, and
  the login response returns the same value as `user.id`.
- `controllers/appointment.js:365` — patient notifications are created with
  `recipientId: patient._id`.

So `recipientId === req.user.id === AuthService.getUser().id`. The list query
matches, and `AuthService.getUser().id` is the correct room to join.

### Client

- `NotificationService` (`core/services/notification.service.ts`) already wraps
  every endpoint this page needs.
- `AuthInterceptor` (`core/services/interceptors/auth.interceptor.ts`) attaches
  the `Authorization: Bearer` header to all outgoing requests.
- `PatientModule` already imports `CommonModule` and `SharedModule`, so
  `<app-loader>` is available with no module wiring.

## Design

### 1. Dependency

Add `socket.io-client@^4.8` to `client/package.json`, matching the server's
`socket.io@^4.8.3`.

### 2. `RealtimeNotificationsService`

New file: `client/src/app/core/services/realtime-notifications.service.ts`.

The socket lives in its own service rather than in the component or in the
existing `NotificationService`. `NotificationService` is a stateless HTTP wrapper
already consumed by doctor code — attaching a persistent connection to it would
give every consumer a socket it did not ask for. Keeping the socket separate also
means the doctor page and a future navbar badge can reuse it without rework, and
the patient component can be tested against a plain `Subject` stub.

Public surface:

- `connect(): void` — idempotent. Reads the user id from `AuthService.getUser()`;
  does nothing if there is no signed-in user. Opens a socket to
  `environment.apiUrl`.
- `notifications$: Observable<NotificationPush>` — emits each pushed notification.
- `disconnect(): void` — tears down the socket and stops emissions.

**The `joinRoom` emit must live inside the socket's `connect` handler, not run
once at setup.** socket.io reconnects automatically after a network interruption,
and room membership does not survive a reconnect. Joining only once means the
page silently stops receiving notifications after the first blip, with no error
to signal it.

The server's push payload is a strict subset of the stored document
(`notificationService.js:41-48`):

```js
{ _id, title, message, type, isRead, createdAt }
```

It carries no `recipientId`, `recipientType`, `relatedAppointmentId`, or
`updatedAt`. The service therefore declares its own `NotificationPush` interface
covering exactly these fields rather than reusing the wider `Notification`
interface, which would claim fields that are never present at runtime.

### 3. Component

`features/patient/notifications/notifications.component.ts` — currently an empty
class, becomes `OnInit, OnDestroy`.

State:

- `notifications: NotificationView[]`
- `loading: boolean`
- `error: string | null`

`NotificationView` holds only the fields common to both a fetched notification
and a pushed one — `_id`, `title`, `message`, `type`, `isRead`, `createdAt`. Both
sources map into this one shape, so a pushed notification and a fetched one
render through an identical path with no branching in the template.

Behaviour:

- `ngOnInit` — call `getMyNotifications()`; on success map into `NotificationView[]`
  and clear `loading`; on error set `error` and clear `loading`. Then call
  `connect()` and subscribe to `notifications$`.
- **Incoming push** — prepend to the list, but only if no existing entry has the
  same `_id`. Without this guard, a notification created while the initial fetch
  is in flight can arrive on both paths and render twice.
- `markAsRead(n)` — returns early if `n.isRead`. Calls the endpoint; sets
  `isRead = true` on success only.
- `remove(n)` — calls the endpoint; removes from the array on success only.
- `unreadCount` getter — counts `!isRead`, drives the badge.
- `iconFor(type)` — maps the `type` enum to the Font Awesome class and colour
  already used in the static markup:

  | type                  | icon                       |
  | --------------------- | -------------------------- |
  | `appointmentBooked`   | `fa-calendar-check`, primary |
  | `appointmentCancelled`| `fa-circle-xmark`, red     |
  | `appointmentReminder` | `fa-bell`, primary         |
  | `MedicalReminder`     | `fa-pills`, primary        |
  | `reviewReceived`      | `fa-star`, primary         |
  | `system`              | `fa-bell`, primary         |

  Unknown types fall back to `fa-bell`, primary.

- `timeAgo(iso)` — renders relative time, matching the existing visual language.
  A component method, not a new shared pipe, since nothing else needs it yet.
  Thresholds:

  | age            | output                        |
  | -------------- | ----------------------------- |
  | < 1 minute     | `Just now`                    |
  | < 1 hour       | `N minutes ago`               |
  | < 24 hours     | `N hours ago`                 |
  | < 48 hours     | `Yesterday`                   |
  | < 7 days       | `N days ago`                  |
  | otherwise      | locale date, e.g. `12/03/2026` |

  Singular forms ("1 minute ago", "1 hour ago", "1 day ago") where the count is 1.
- `ngOnDestroy` — unsubscribe and `disconnect()`.

### 4. Template

`notifications.component.html` keeps its current layout — header, card shell,
icon-circle rows. The four hardcoded blocks collapse into a single `*ngFor` with
`trackBy` on `_id`. Added:

- `<app-loader message="Loading notifications…">` while `loading`
- An inline error message with a retry action when `error` is set
- An empty state when the list is empty
- Unread rows get a subtle background tint
- A check button on unread rows only (mark as read)
- A delete button on every row
- The badge binds to `unreadCount` and is hidden when zero

### 5. Error handling

A failed list fetch shows an inline retry message rather than an empty card, so a
network failure is not mistaken for "you have no notifications". Mark-read and
delete mutate local state only after the request succeeds — no optimistic update,
so there is nothing to roll back and a failure simply leaves the row as it was.

### 6. Testing

`notifications.component.spec.ts` exists as a default stub. It gets
`HttpClientTestingModule` and a stub realtime service exposing a `Subject`, covering:

- Fetched notifications render
- Badge shows the unread count
- Mark-read flips the row to read
- Delete removes the row
- A pushed notification is prepended
- A pushed notification with an `_id` already in the list is ignored
- A failed fetch shows the error state

## Known issue, not addressed here

`NotificationService.markAllAsRead()` (`notification.service.ts:41`) calls
`PUT /notifications/read-all`. That route is **not registered** in
`server/routes/notification.js`, though the `markAllAsRead` controller exists and
is exported. The method is currently dead code — nothing calls it — so it is
left untouched under this spec's scope. Whoever wires up a mark-all button must
register the route first, or the call will 404.
