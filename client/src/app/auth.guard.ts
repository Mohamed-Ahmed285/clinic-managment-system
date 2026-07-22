import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

  console.log("Patient guard checked");

  const token = localStorage.getItem('token');

  console.log("Token:", token);


  if(token){
    return true;
  }

  this.router.navigate(['auth/login']);
  return false;
}


}
