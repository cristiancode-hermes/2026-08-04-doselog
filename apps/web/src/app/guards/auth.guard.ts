import { inject } from '@angular/core';
import { CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { lastValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (): Promise<
  boolean | UrlTree
> => {
  const token = localStorage.getItem('doselog-token');

  if (!token) {
    const { Router } = await import('@angular/router');
    const router = inject(Router);
    return router.parseUrl('/login');
  }

  const authService = inject(AuthService);

  try {
    await lastValueFrom(authService.getProfile());
    return true;
  } catch {
    localStorage.removeItem('doselog-token');
    authService.token.set(null);
    authService.currentUser.set(null);
    const { Router } = await import('@angular/router');
    const router = inject(Router);
    return router.parseUrl('/login');
  }
};
