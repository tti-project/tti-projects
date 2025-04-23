import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { routesData } from './shared/routes/routes.data';
import { User } from './core/models/user.model';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    NotificationComponent
  ],
})
export class AppComponent {
  title = 'Task Tracking Interface';
  routesData = routesData;
  user: User | null = null;
  opened = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUserValue?.user || null;
    console.log(this.user);
    this.authService.currentUser$.subscribe((response) => {
      if (response) {
        // Create a User object that matches the core User model
        this.user = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || '', // Assuming username can be used as name
          role: response.user.role as 'admin' | 'member' | 'guest',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        this.user = null;
      }
    });
  }

  toggleSidenav() {
    this.opened = !this.opened;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.opened = false;
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
