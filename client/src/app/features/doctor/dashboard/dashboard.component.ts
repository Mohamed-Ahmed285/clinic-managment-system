import { Component } from '@angular/core';
import { Appointment, NotificationItem, PanelStat, RatingSummary } from '../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  doctorName = 'Dr. Nakamura';
  todayLabel = 'Tuesday · November 18';

  appointments: Appointment[] = [
    { time: '08:30', patientName: 'Priya Shah', visitType: 'Follow-up · HTN', status: 'Checked in' },
    { time: '09:00', patientName: 'Marcus Lee', visitType: 'New patient · Chest pain', status: 'Waiting' },
    { time: '09:30', patientName: 'Elena Alvarez', visitType: 'Post-op · Day 14', status: 'In room' },
    { time: '10:15', patientName: "James O'Neal", visitType: 'Annual physical', status: 'Upcoming' },
    { time: '10:40', patientName: 'Alex Morgan', visitType: 'Follow-up · Statin therapy', status: 'Upcoming' },
    { time: '11:20', patientName: 'Yuki Tanaka', visitType: 'Consult · Arrhythmia', status: 'Upcoming' }
  ];

  panelStats: PanelStat[] = [
    { label: 'Active patients', value: '482' },
    { label: 'Duration time', value: '22m' },
    { label: 'Total appointments', value: '12' },
    { label: 'Completed appointments', value: '4' }
  ];

  ratingSummary: RatingSummary = {
    averageRating: 4.6,
    maxRating: 5,
    ratingCount: 213,
    eligiblePatients: 482
  };

  notifications: NotificationItem[] = [
    { senderName: 'Alex Morgan', subject: 'Question about new dosage', preview: "Since starting the higher dose I've noticed some mild…", timeAgo: '1h', read: false },
    { senderName: 'Elena Alvarez', subject: 'Post-op incision photo', preview: 'Sending the photo you asked for from this morning…', timeAgo: '3h', read: false },
    { senderName: "James O'Neal", subject: 'Re: annual physical prep', preview: 'Thanks — will fast starting at 8pm the night before…', timeAgo: '1d', read: true },
    { senderName: 'Yuki Tanaka', subject: 'Palpitations log (week 2)', preview: "Attaching this week's log. Frequency is decreasing…", timeAgo: '2d', read: true }
  ];
}
