import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const user = this.authService.getUser();

    if (!user) {

      this.router.navigate(['/auth/login']);

      return false;

    }

    const allowedRoles = route.data['roles'];

    if (allowedRoles.includes(user.role)) {

      return true;

    }

    this.router.navigate(['/unauthorized']);

    return false;

  }

}
