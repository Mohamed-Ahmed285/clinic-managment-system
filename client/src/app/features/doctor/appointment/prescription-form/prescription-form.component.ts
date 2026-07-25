import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Medication } from '../../models/appointment.model';
@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent implements OnInit {
  @Input() issuedAt: string = '';
  @Output() save = new EventEmitter<{ medications: Medication[]; generalNotes: string }>();

  frequencyOptions: string[] = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 8 hours',
    'As needed'
  ];

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      medications: this.fb.array([this.createMedicationGroup()]),
      generalNotes: ['']
    });
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }
}
