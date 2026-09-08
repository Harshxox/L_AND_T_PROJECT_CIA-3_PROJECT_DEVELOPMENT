import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('token'));
  
  isLoggedIn = computed(() => !!this.token() && !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || 'MEMBER');

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  register(data: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ success: boolean; data: { token: string; user: User } }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.token.set(res.data.token);
          this.currentUser.set(res.data.user);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  updateProfile(profile: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profile).pipe(
      tap((res: any) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }
}
