import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: any): boolean {
    const expectedRole = route.data['admin'];
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (currentUser.user.role !== expectedRole) {
      // this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
