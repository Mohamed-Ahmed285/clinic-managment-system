export interface Appointment {
  id:string;
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
  id: string;
  senderName: string;
  subject: string;
  preview: string;
  timeAgo: string;

  expanded?: boolean;

  appointmentDetails?: {
    patientName: string;
    clinicName: string;
    date: string;
    time: string;
    fee: number;
    status: string;
  };
}
