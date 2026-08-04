import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-bg flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <a routerLink="/login" class="inline-block">
            <span class="text-4xl">💊</span>
            <h1 class="mt-2 text-2xl font-bold text-ink">DoseLog</h1>
            <p class="text-sm text-ink-muted mt-1">
              Personal Medication Tracker
            </p>
          </a>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayout {}
