import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-layout">
      <div class="auth-form-container">
        <div class="mb-2">
          <span class="badge badge-warning mb-1">GYMLAND ECOSYSTEM</span>
          <h1>{{ isLoginMode ? 'Log in' : 'Register' }}</h1>
          <p class="text-iron">Access your iron & chalk data, workouts, and bookings.</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <!-- Quick Demo Switcher Buttons -->
        <div class="quick-demo-box mb-2">
          <span class="mono-data text-iron-muted" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Quick Demo Fill:</span>
          <div class="flex gap-1 mt-1 flex-wrap">
            <button type="button" class="btn btn-sm btn-outline" (click)="fillDemo('admin@gymland.com')">Admin</button>
            <button type="button" class="btn btn-sm btn-outline" (click)="fillDemo('trainer@gymland.com')">Trainer</button>
            <button type="button" class="btn btn-sm btn-outline" (click)="fillDemo('member@gymland.com')">Member</button>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div *ngIf="!isLoginMode">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="name" name="name" required placeholder="John Doe">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" [(ngModel)]="phone" name="phone" placeholder="+1 (555) 000-0000">
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="member@gymland.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••">
          </div>

          <button type="submit" class="btn btn-primary w-full mt-1" [disabled]="isLoading">
            {{ isLoading ? 'Please wait...' : (isLoginMode ? 'Log in' : 'Register Account') }}
          </button>
        </form>

        <div class="mt-2 text-center" style="border-top: 1px solid rgba(74,71,68,0.2); padding-top: 1.25rem;">
          <p class="text-iron">
            <a href="javascript:void(0)" (click)="toggleMode()" style="color: var(--charcoal); font-weight: 600; text-decoration: underline;">
              {{ isLoginMode ? 'Switch to Register' : 'Switch to Log in' }}
            </a>
          </p>
        </div>
      </div>

      <div class="auth-stat-hero" style="background: linear-gradient(135deg, rgba(28,27,26,0.92), rgba(17,17,17,0.95)), url('/images/hero.jpg') center/cover no-repeat;">
        <div class="hero-content">
          <div class="hero-brand-pill mb-2">
            <span class="pulse-dot"></span> HIGH-PERFORMANCE TRAINING FACILITY
          </div>
          <h2>ELITE FITNESS & ATHLETE MANAGEMENT</h2>
          <div class="hero-stat-row mt-2">
            <div class="stat-card">
              <div class="hero-stat-number">248</div>
              <p class="mono-data text-iron-muted">ACTIVE ATHLETES</p>
            </div>
            <div class="stat-card">
              <div class="hero-stat-number">100%</div>
              <p class="mono-data text-iron-muted">VERIFIED PASSES</p>
            </div>
          </div>
          <p class="mono-data text-iron-muted mt-2" style="font-size: 0.85rem;">
            Real-time telemetry, PT session tracking, QR turnstiles, and automated progress analytics.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; min-height: 100vh; }
    .auth-form-container { padding: 4rem; display: flex; flex-direction: column; justify-content: center; background: var(--stone); }
    .auth-stat-hero {
      color: var(--stone);
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 8px solid var(--chalk-yellow);
      position: relative;
    }
    .hero-content { position: relative; z-index: 2; max-width: 540px; }
    .hero-brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(230, 204, 60, 0.15);
      border: 1px solid var(--chalk-yellow);
      color: var(--chalk-yellow);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--chalk-yellow);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--chalk-yellow);
    }
    .hero-stat-row { display: flex; gap: 2rem; }
    .stat-card { background: rgba(0,0,0,0.4); padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .hero-stat-number { font-size: 3.5rem; line-height: 1; font-family: var(--font-mono); color: var(--chalk-yellow); font-weight: 700; }
    .quick-demo-box {
      background: rgba(0,0,0,0.04);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px dashed rgba(74,71,68,0.3);
    }
    @media (max-width: 860px) {
      .auth-layout { grid-template-columns: 1fr; }
      .auth-stat-hero { display: none; }
      .auth-form-container { padding: 2rem; }
    }
  `]
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  name = '';
  email = 'admin@gymland.com';
  password = 'Password123!';
  phone = '';

  fillDemo(email: string) {
    this.email = email;
    this.password = 'Password123!';
    this.isLoginMode = true;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed. Check your credentials.';
        }
      });
    } else {
      this.authService.register({ name: this.name, email: this.email, password: this.password, phone: this.phone }).subscribe({
        next: () => {
          this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/dashboard']);
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      });
    }
  }
}
