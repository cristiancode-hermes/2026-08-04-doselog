import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-ink text-center">Sign In</h2>

      @if (error()) {
        <div class="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
          {{ error() }}
        </div>
      }

      <form (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1">Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
        </div>

        <button
          type="submit"
          [disabled]="loading()"
          class="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          @if (loading()) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Signing in...
          } @else {
            Sign In
          }
        </button>
      </form>

      <p class="text-center text-sm text-ink-muted">
        Don't have an account?
        <a routerLink="/register" class="text-primary hover:underline font-medium">Create one</a>
      </p>
    </div>
  `,
})
export class LoginPage {
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async submit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.login({
        email: this.email(),
        password: this.password(),
      }).toPromise();
      this.router.navigateByUrl('/dashboard');
    } catch (err: any) {
      this.error.set(err?.error?.message || err?.message || 'Invalid email or password');
    } finally {
      this.loading.set(false);
    }
  }
}
