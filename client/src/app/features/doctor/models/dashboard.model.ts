export interface Appointment {
  time: string;
  patientName: string;
  visitType: string;
  status: 'Checked in' | 'Waiting' | 'In room' | 'Upcoming' | 'Completed';
}

export interface PanelStat {
  label: string;
  value: string;
}

export interface RatingSummary {
  averageRating: number;
  maxRating: number;
  ratingCount: number;
  eligiblePatients: number;
}

export interface NotificationItem {
  senderName: string;
  subject: string;
  preview: string;
  timeAgo: string;
  read: boolean;
}
