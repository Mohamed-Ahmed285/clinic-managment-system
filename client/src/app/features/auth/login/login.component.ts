import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = 'alex@example.com';
  password = '12345678';
  rememberMe = false;
  showPassword = false;

  onSubmit(): void {}

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
