export interface PatientInfo {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  visitType: string;
  visitReason: string;
}

export type HistoryEntryType = 'Condition' | 'Allergy' | 'Prescription';

export interface MedicalHistoryEntry {
  date: string;
  type: HistoryEntryType;
  description: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  times: string[];
  notes: string;
}

export interface Appointment {
  time: string;
  patient: PatientInfo;
  history: MedicalHistoryEntry[];
  medications: Medication[];
  generalNotes: string;
  issuedAt: string;
}
