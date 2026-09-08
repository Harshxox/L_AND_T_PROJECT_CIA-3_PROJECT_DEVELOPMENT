import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav *ngIf="auth.isLoggedIn()" class="navbar flex items-center justify-between">
      <div class="flex items-center">
        <a routerLink="/dashboard" class="logo">GYMLAND</a>
        <div class="nav-links flex items-center">
          <a routerLink="/dashboard" routerLinkActive="active">DASHBOARD</a>
          <a routerLink="/classes" routerLinkActive="active">CLASSES & PT</a>
          <a routerLink="/plans" routerLinkActive="active">PLANS & SHOP</a>
          
          <ng-container *ngIf="auth.userRole() === 'MEMBER'">
            <a routerLink="/qr-pass" routerLinkActive="active">MY QR PASS</a>
            <a routerLink="/progress" routerLinkActive="active">PROGRESS & ROUTINE</a>
          </ng-container>

          <ng-container *ngIf="auth.userRole() === 'TRAINER'">
            <a routerLink="/coaching" routerLinkActive="active">COACHING HUB</a>
          </ng-container>

          <ng-container *ngIf="auth.userRole() === 'BRANCH ADMIN'">
            <a routerLink="/coaching" routerLinkActive="active">COACHING</a>
            <a routerLink="/admin" routerLinkActive="active">ADMIN HUB</a>
          </ng-container>
        </div>
      </div>

      <div class="flex items-center">
        <span class="user-badge mono-data">
          {{ auth.currentUser()?.name }} // {{ auth.currentUser()?.role }}
        </span>
        <button class="btn btn-sm btn-outline logout-btn" (click)="auth.logout()">Log Out</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: var(--charcoal);
      color: var(--stone);
      padding: 0.85rem 2rem;
      border-bottom: 4px solid var(--chalk-yellow);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .logo {
      font-size: 1.6rem;
      font-family: var(--font-display);
      margin-right: 2.5rem;
      color: var(--chalk-yellow);
      font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.5px;
    }
    .nav-links a {
      color: var(--stone);
      text-decoration: none;
      margin-right: 1.25rem;
      font-family: var(--font-display);
      font-size: 1.05rem;
      letter-spacing: 0.5px;
      transition: color 0.15s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--chalk-yellow);
    }
    .user-badge {
      margin-right: 1.25rem;
      font-size: 0.85rem;
      background: rgba(255,255,255,0.08);
      padding: 0.35rem 0.75rem;
      border-radius: 2px;
      color: var(--stone);
    }
    .logout-btn {
      border-color: var(--stone);
      color: var(--stone);
    }
    .logout-btn:hover {
      background-color: var(--chalk-yellow);
      color: var(--charcoal);
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
}
