import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles: string[] = route.data['roles'] || [];
  const currentRole = authService.userRole();

  if (authService.isLoggedIn() && expectedRoles.includes(currentRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
