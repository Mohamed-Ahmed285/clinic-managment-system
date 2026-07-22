export interface ScheduleEntry {
  days: string[];
  start: string; // HH:mm (24h, used by <input type="time">)
  end: string;   // HH:mm
}

export interface Clinic {
  name: string;
  address: string;
  status: 'Active' | 'Inactive';
  consultationFee: number;
  schedule: ScheduleEntry[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  yearsExperience: number;
  specialty: string;
  appointmentDuration: number;
  bio: string;
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
