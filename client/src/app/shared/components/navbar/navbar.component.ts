import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  role = '';
  isLoggedIn = false;
  userName = '';

  readonly navLinkActiveClass =
    'bg-[#e3f5ea] text-primary font-medium';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.isLoggedIn = true;
      this.role = user.role;
      this.userName = user.name;
    }
  }

  get accountTypeLabel(): string {
    switch (this.role) {
      case 'doctor':
        return 'Doctor account';
      case 'patient':
        return 'Patient account';
      case 'admin':
        return 'Admin account';
      default:
        return '';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
