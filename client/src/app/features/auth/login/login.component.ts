import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Component properties updated directly by your HTML
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.isSubmitting = true;

    // Send the request
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        switch (response.user.role) {
          case 'patient':
            this.router.navigate(['/']);
            break;

          case 'doctor':
            this.router.navigate(['/doctor']);
            break;

          case 'admin':
            this.router.navigate(['/admin']);
            break;

          default:
            this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Login failed', err);

        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string' && err.error) {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      }
    });
  }

  onEmailInput(event: Event): void {
    this.email = (event.target as HTMLInputElement).value;
  }

  onPasswordInput(event: Event): void {
    this.password = (event.target as HTMLInputElement).value;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRememberMeChange(event: Event): void {
    this.rememberMe = (event.target as HTMLInputElement).checked;
  }
}
