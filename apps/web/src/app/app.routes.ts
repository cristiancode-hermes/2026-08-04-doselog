import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./layouts/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/login/login-page').then((m) => m.LoginPage),
      },
    ],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./layouts/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/register/register-page').then((m) => m.RegisterPage),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'medications',
        loadComponent: () =>
          import('./pages/medication-list/medication-list-page').then((m) => m.MedicationListPage),
      },
      {
        path: 'medications/new',
        loadComponent: () =>
          import('./pages/medication-form/medication-form-page').then((m) => m.MedicationFormPage),
      },
      {
        path: 'medications/:id',
        loadComponent: () =>
          import('./pages/medication-detail/medication-detail-page').then((m) => m.MedicationDetailPage),
      },
      {
        path: 'medications/:id/edit',
        loadComponent: () =>
          import('./pages/medication-form/medication-form-page').then((m) => m.MedicationFormPage),
      },
      {
        path: 'medications/:id/refills',
        loadComponent: () =>
          import('./pages/refill-log/refill-log-page').then((m) => m.RefillLogPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/calendar-page/calendar-page').then((m) => m.CalendarPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings-page').then((m) => m.SettingsPageComponent),
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
