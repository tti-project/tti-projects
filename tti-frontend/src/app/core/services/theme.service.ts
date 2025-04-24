import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  constructor() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || this.LIGHT_THEME;
    this.setTheme(savedTheme);
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  toggleTheme(): void {
    const newTheme = this.isDarkMode() ? this.LIGHT_THEME : this.DARK_THEME;
    this.setTheme(newTheme);
  }

  private setTheme(theme: string): void {
    if (theme === this.DARK_THEME) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
