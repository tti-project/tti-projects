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
import { ThemeService } from './core/services/theme.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

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
    NotificationComponent,
    TranslateModule
  ]
})
export class AppComponent {
  title = 'Task Tracking Interface';
  routesData = routesData;
  user: User | null = null;
  opened = true;
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private translate: TranslateService
  ) {
    this.user = this.authService.currentUserValue?.user || null;
    this.authService.currentUser$.subscribe((response) => {
      if (response) {
        this.user = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || '',
          role: response.user.role as 'admin' | 'member' | 'guest',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        this.user = null;
      }
    });
    this.translate.setDefaultLang('en');
    this.translate.use('en');
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
  }
}
