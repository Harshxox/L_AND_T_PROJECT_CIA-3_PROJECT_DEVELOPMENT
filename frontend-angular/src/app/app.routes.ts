import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'BRANCH ADMIN') {
        return import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent);
      } else if (user.role === 'TRAINER') {
        return import('./pages/trainer-dashboard/trainer-dashboard.component').then(m => m.TrainerDashboardComponent);
      } else {
        return import('./pages/member-dashboard/member-dashboard.component').then(m => m.MemberDashboardComponent);
      }
    }
  },
  {
    path: 'classes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/classes/classes.component').then(m => m.ClassesComponent)
  },
  {
    path: 'plans',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent)
  },
  {
    path: 'progress',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent)
  },
  {
    path: 'qr-pass',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/qr-pass/qr-pass.component').then(m => m.QrPassComponent)
  },
  {
    path: 'coaching',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TRAINER', 'BRANCH ADMIN'] },
    loadComponent: () => import('./pages/trainer-dashboard/trainer-dashboard.component').then(m => m.TrainerDashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BRANCH ADMIN'] },
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
