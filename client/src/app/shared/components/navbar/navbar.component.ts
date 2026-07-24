import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  role = '';
  isLoggedIn = false;

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
      this.isLoggedIn = true;
      this.role = user.role;
    }
  }


}
