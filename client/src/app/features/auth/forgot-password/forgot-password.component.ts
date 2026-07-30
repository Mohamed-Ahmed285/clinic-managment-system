import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.isValidEmail(trimmedEmail)) {
      this.errorMessage = 'Enter a valid email address.';
      return;
    }

    this.isSubmitting = true;

    this.authService.forgetPassword(trimmedEmail).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMessage =
          (typeof res === 'string' && res) ||
          'If an account exists for this email, a reset link has been sent. Please check your inbox.';
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error(err);

        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string' && err.error) {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Something went wrong. Please try again later.';
        }
      },
    });
  }

  onEmailInput(event: Event): void {
    this.email = (event.target as HTMLInputElement).value;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
