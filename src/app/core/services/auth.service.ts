import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, Role } from '../models/auth.models';
import { stripRolePrefix } from '../utils/role.utils';

const STORAGE_KEY = 'bus_session';

const ROLE_HOME: Record<Role, string> = {
  USER: '/search',
  SUPER_ADMIN: '/admin',
  SUPER_MANAGER: '/super-manager',
  TRIP_MANAGER: '/trips',
  BUS_MANAGER: '/buses',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/auth`;

  // Private writable signal, public read-only view
  private _session = signal<AuthResponse | null>(this.loadSession());
  readonly session = this._session.asReadonly();

  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly role = computed(() => this._session()?.role ?? null);
  readonly username = computed(() => this._session()?.username ?? null);
  readonly passwordChangeRequired = computed(
    () => this._session()?.passwordChangeRequired ?? false
  );

  token(): string | null {
    return this._session()?.token ?? null;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
    map((res) => ({ ...res, role: stripRolePrefix(res.role) })),
    tap((res) => this.saveSession(res))
  );
}

  changePassword(oldPassword: string, newPassword: string): Observable<unknown> {
    const username = this._session()?.username;
    return this.http.post(`${this.baseUrl}/change-password`, {
      username,
      oldPassword,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._session.set(null);
    this.router.navigateByUrl('/login');
  }

  /** Where should this user be right now? Used by login and guards. */
  landingUrl(): string {
    const s = this._session();
    if (!s) return '/login';
    if (s.passwordChangeRequired) return '/change-password';
    return ROLE_HOME[s.role] ?? '/login';
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this._session.set(res);
  }

  private loadSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}