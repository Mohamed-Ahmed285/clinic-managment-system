import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  showPopup = false;

   constructor(
    private authService: AuthService,
    private router: Router
  ) {}

openPopup() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/patient/appointments']);
    } else {
      this.showPopup = true;
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}
