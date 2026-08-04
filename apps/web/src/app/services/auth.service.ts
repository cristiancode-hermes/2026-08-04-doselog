import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService extends ApiService {
  readonly currentUser = signal<User | null>(null);
  readonly token = signal<string | null>(localStorage.getItem('doselog-token'));
  readonly isLoggedIn = computed(() => this.token() !== null);

  constructor(private http: HttpClient) {
    super();
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    timezone: string;
  }): Observable<{ user: User; token: string }> {
    return this.http
      .post<{ user: User; token: string }>(
        this.buildUrl('/api/auth/register'),
        data
      )
      .pipe(
        tap((res) => {
          this.setSession(res.token, res.user);
        })
      );
  }

  login(data: {
    email: string;
    password: string;
  }): Observable<{ user: User; token: string }> {
    return this.http
      .post<{ user: User; token: string }>(
        this.buildUrl('/api/auth/login'),
        data
      )
      .pipe(
        tap((res) => {
          this.setSession(res.token, res.user);
        })
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(this.buildUrl('/api/auth/profile')).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.token.set(localStorage.getItem('doselog-token'));
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http
      .patch<User>(this.buildUrl('/api/auth/profile'), data)
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
        })
      );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(this.buildUrl('/api/auth/account')).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('doselog-token', token);
    this.token.set(token);
    this.currentUser.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem('doselog-token');
    this.token.set(null);
    this.currentUser.set(null);
  }
}
