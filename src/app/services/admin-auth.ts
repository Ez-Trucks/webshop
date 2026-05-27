import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

@Injectable({
  providedIn: 'root',
})
export class AdminAuth {
  private http = inject(HttpClient);
  private readonly tokenKey = 'ez_trucks_auth_token';
  private readonly userKey = 'ez_trucks_auth_user';
  private readonly baseUrl = `${API_BASE_URL}/auth`;
  private userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  user$ = this.userSubject.asObservable();

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { name, email, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
