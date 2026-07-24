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
  email = 'patient@example.com';
  password = 'password123';
  rememberMe = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const credentials = {
      email: this.email,
      password: this.password
    };

    // Send the request
    this.authService.login(credentials).subscribe({
      next: (response) => {
        switch (response.user.role) {
          case 'patient':
            this.router.navigate(['/patient']);
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
        console.error('Login failed', err);
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
