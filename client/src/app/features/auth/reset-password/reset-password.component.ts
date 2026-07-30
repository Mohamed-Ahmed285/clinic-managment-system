import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'This reset link is invalid or has expired. Please request a new one.';
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token) {
      this.errorMessage = 'This reset link is invalid or has expired. Please request a new one.';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'New password is required.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Your password has been reset successfully. Redirecting to sign in…';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
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

  onNewPasswordInput(event: Event): void {
    this.newPassword = (event.target as HTMLInputElement).value;
  }

  onConfirmPasswordInput(event: Event): void {
    this.confirmPassword = (event.target as HTMLInputElement).value;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
