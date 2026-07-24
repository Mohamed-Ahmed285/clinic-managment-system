export interface ScheduleEntry {
  days: string[];
  start: string; // HH:mm (24h, used by <input type="time">)
  end: string;   // HH:mm
}

export interface Clinic {
  id?: string;
  selectedClinicId?: string;
  name: string;
  address: string;
  status: 'Active' | 'Inactive';
  isActiveAtClinic: boolean;
  consultationFee: number;
  schedule: ScheduleEntry[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  yearsExperience: number;
  specialtyId: string;
  appointmentDuration: number;
  bio: string;
}

export const WEEK_DAYS = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' }
];
