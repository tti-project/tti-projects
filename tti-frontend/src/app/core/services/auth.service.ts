import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, tap, catchError } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<{ user: User; token: string } | null>;
  public currentUser$: Observable<{ user: User; token: string } | null>;
  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<{ user: User; token: string } | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): { user: User; token: string } | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<{ user: User; token: string; refreshToken: string; accessToken: string }> {
    return this.http.post<{ user: User; token: string; refreshToken: string; accessToken: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.startRefreshTokenTimer();
        }),
        catchError(this.handleError)
      );
  }

  register(name: string, email: string, password: string): Observable<{ user: User; token: string; refreshToken: string; accessToken: string }> {
    return this.http.post<{ user: User; token: string; refreshToken: string; accessToken: string }>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.startRefreshTokenTimer();
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.stopRefreshTokenTimer();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ user: User; token: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ user: User; token: string; refreshToken: string; accessToken: string }>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.startRefreshTokenTimer();
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private setSession(response: { user: User; refreshToken: string; accessToken: string }) {
    localStorage.setItem('currentUser', JSON.stringify({ user: response.user, token: response.accessToken }));
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('accessToken', response.accessToken);
    this.currentUserSubject.next({ user: response.user, token: response.accessToken });
  }

  private startRefreshTokenTimer() {
    // Set timer to refresh token 1 minute before it expires
    const token = this.getToken();
    if (token) {
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  getCurrentUser(): User | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.user : null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.token : null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    // }
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;


    } else {

      // Server-side error
      errorMessage = error.error.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
