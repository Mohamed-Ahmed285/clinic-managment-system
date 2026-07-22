import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  dateOfBirth = '';
  gender = '';
  address = {
    city: '',
    state: '',
    country: '',
  };
  preferredPaymentMethod = 'cash';
  showPassword = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'Full name is required.';
      return;
    }

    if (this.name.trim().length < 3 || this.name.trim().length > 50) {
      this.errorMessage = 'Full name must be between 3 and 50 characters.';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const payload = this.buildRegistrationPayload();
    console.log('Registration payload:', payload);
  }

  buildRegistrationPayload() {
    return {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      phone: this.phone.trim() || undefined,
      dateOfBirth: this.dateOfBirth || undefined,
      gender: this.gender || undefined,
      address: {
        city: this.address.city.trim() || undefined,
        state: this.address.state.trim() || undefined,
        country: this.address.country.trim() || undefined,
      },
      preferredPaymentMethod: this.preferredPaymentMethod,
    };
  }

  onNameInput(event: Event): void {
    this.name = (event.target as HTMLInputElement).value;
  }

  onEmailInput(event: Event): void {
    this.email = (event.target as HTMLInputElement).value;
  }

  onPhoneInput(event: Event): void {
    this.phone = (event.target as HTMLInputElement).value;
  }

  onPasswordInput(event: Event): void {
    this.password = (event.target as HTMLInputElement).value;
  }

  onConfirmPasswordInput(event: Event): void {
    this.confirmPassword = (event.target as HTMLInputElement).value;
  }

  onDateOfBirthInput(event: Event): void {
    this.dateOfBirth = (event.target as HTMLInputElement).value;
  }

  onGenderChange(event: Event): void {
    this.gender = (event.target as HTMLSelectElement).value;
  }

  onAddressCityInput(event: Event): void {
    this.address.city = (event.target as HTMLInputElement).value;
  }

  onAddressStateInput(event: Event): void {
    this.address.state = (event.target as HTMLInputElement).value;
  }

  onAddressCountryInput(event: Event): void {
    this.address.country = (event.target as HTMLInputElement).value;
  }

  onPreferredPaymentMethodChange(event: Event): void {
    this.preferredPaymentMethod = (event.target as HTMLSelectElement).value;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
