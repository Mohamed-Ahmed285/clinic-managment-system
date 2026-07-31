import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cancel-reason-model',
  templateUrl: './cancel-reason-model.component.html',
  styleUrls: ['./cancel-reason-model.component.css'],
})
export class CancelReasonModelComponent {
  @Output() confirm = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  reason = '';
  submitted = false;

  onConfirm() {
    this.submitted = true;

    if (!this.reason.trim()) {
      return;
    }

    this.confirm.emit(this.reason);
  }

  onClose() {
    this.reason = '';
    this.submitted = false;
    this.close.emit();
  }
}
