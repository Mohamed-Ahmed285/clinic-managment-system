import { Component, OnInit } from '@angular/core';
import { Appointment, Medication } from '../models/appointment.model';
@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  appointment!: Appointment;

  ngOnInit(): void {
    // Replace with data from a service / route resolver when wiring up the backend
    this.appointment = {
      time: '08:30',
      patient: {
        fullName: 'Priya Shah',
        age: 54,
        gender: 'Female',
        phone: '+1 (415) 555-0123',
        visitType: 'Follow-up',
        visitReason: 'HTN'
      },
      history: [
        { date: '2024-08-12', type: 'Condition', description: 'Stage 1 hypertension' },
        { date: '2023-11-04', type: 'Allergy', description: 'Penicillin — hives' },
        { date: '2025-03-20', type: 'Prescription', description: 'Lisinopril 10mg, once daily' }
      ],
      medications: [],
      generalNotes: '',
      issuedAt: 'Jul 25, 2026, 12:25 AM'
    };
  }

  onSavePrescription(payload: { medications: Medication[]; generalNotes: string }): void {
    this.appointment.medications = payload.medications;
    this.appointment.generalNotes = payload.generalNotes;
    // Replace with a service call to persist the prescription
    console.log('Prescription saved', payload);
  }
}
