import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-bg">
      <!-- Top Navbar -->
      <nav class="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
        <div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <a routerLink="/dashboard" class="flex items-center gap-2 shrink-0">
            <span class="text-xl">💊</span>
            <span class="font-semibold text-ink hidden sm:inline">DoseLog</span>
          </a>

          <!-- Search -->
          <div class="flex-1 max-w-md mx-auto">
            <input
              type="search"
              placeholder="Search medications..."
              class="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <!-- User Menu -->
          <div class="relative" (mouseenter)="showUserMenu.set(true)" (mouseleave)="showUserMenu.set(false)">
            <button class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-ink hover:bg-bg transition-colors">
              <span class="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                {{ (auth.currentUser()?.name || 'U').charAt(0).toUpperCase() }}
              </span>
              <span class="hidden sm:inline text-ink-muted">{{ auth.currentUser()?.name || 'User' }}</span>
            </button>

            @if (showUserMenu()) {
              <div class="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-surface p-2 shadow-lg">
                <a routerLink="/settings" class="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-bg transition-colors">Profile & Settings</a>
                <button (click)="logout()" class="w-full text-left rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors">
                  Sign Out
                </button>
              </div>
            }
          </div>
        </div>
      </nav>

      <div class="mx-auto flex max-w-7xl">
        <!-- Desktop Sidebar -->
        <aside class="hidden lg:flex w-56 shrink-0 flex-col gap-1 border-r border-border px-3 py-6">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-primary/10 text-primary font-medium"
              class="rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-bg hover:text-ink transition-colors"
            >
              {{ link.label }}
            </a>
          }
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0 px-4 py-6 pb-20 lg:pb-6">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile Bottom Nav -->
      <nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface lg:hidden">
        <div class="flex items-center justify-around py-2">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="text-primary"
              class="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-ink-muted transition-colors"
            >
              <span class="text-lg">{{ link.icon }}</span>
              <span>{{ link.label }}</span>
            </a>
          }
        </div>
      </nav>
    </div>
  `,
})
export class DashboardLayout {
  readonly showUserMenu = signal(false);

  readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/medications', label: 'Medications', icon: '💊' },
    { path: '/history', label: 'History', icon: '📅' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
