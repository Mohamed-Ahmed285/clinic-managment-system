import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css']
})
export class ProfileHeaderComponent {
  @Output() save = new EventEmitter<void>();

  showSuccess = false;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  onSaveClick(): void {
    this.save.emit();

    this.showSuccess = true;

    // Reset the timer if the user clicks Save again before it hides
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hideTimeout = setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }
}
