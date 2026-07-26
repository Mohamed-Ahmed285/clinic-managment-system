import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Medication } from '../../models/appointment.model';
@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent implements OnInit, OnDestroy {
  @Input() issuedAt: string = '';
  @Input() saving: boolean = false;
  @Output() save = new EventEmitter<{
    diagnosis: string;
    symptoms: string;
    medications: Medication[];
    generalNotes: string;
  }>();

  // Set once the doctor tries to submit an invalid form, so the template can
  // show validation errors instead of silently doing nothing.
  attemptedSubmit = false;

  frequencyOptions: string[] = [
    'Once Daily',
    'Twice Daily',
    'Three Times Daily',
    'Every 6 Hours',
    'Every 8 Hours',
    'Every 12 Hours'
  ];

  form!: FormGroup;

  // Live clock shown while the doctor is writing the prescription. Once an
  // issuedAt is passed in from the parent (an existing prescription), that
  // takes priority and the clock stops ticking.
  liveIssuedAt: string = '';
  private clockHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      diagnosis: ['', Validators.required],
      symptoms: [''],
      medications: this.fb.array([this.createMedicationGroup()]),
      generalNotes: ['']
    });

    if (!this.issuedAt) {
      this.startClock();
    }
  }

  ngOnDestroy(): void {
    this.stopClock();
  }

  private startClock(): void {
    this.liveIssuedAt = new Date().toLocaleString();
    this.clockHandle = setInterval(() => {
      this.liveIssuedAt = new Date().toLocaleString();
    }, 1000);
  }

  private stopClock(): void {
    if (this.clockHandle) {
      clearInterval(this.clockHandle);
      this.clockHandle = null;
    }
  }

  get displayIssuedAt(): string {
    return this.issuedAt || this.liveIssuedAt;
  }

  get medications(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  timesArray(medicationIndex: number): FormArray {
    return this.medications.at(medicationIndex).get('times') as FormArray;
  }

  createMedicationGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: [''],
      times: this.fb.array([]),
      notes: ['']
    });
  }

  addMedication(): void {
    this.medications.push(this.createMedicationGroup());
  }

  removeMedication(index: number): void {
    if (this.medications.length > 1) {
      this.medications.removeAt(index);
    }
  }

  addTime(medicationIndex: number): void {
    this.timesArray(medicationIndex).push(this.fb.control(''));
  }

  removeTime(medicationIndex: number, timeIndex: number): void {
    this.timesArray(medicationIndex).removeAt(timeIndex);
  }

  onSubmit(): void {
    this.attemptedSubmit = true;

    if (this.saving) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Stop the live clock once submitted; the parent will set the real issuedAt.
    this.stopClock();
    this.save.emit(this.form.value);
  }
}
