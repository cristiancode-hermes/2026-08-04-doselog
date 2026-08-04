import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-ink text-center">Create Account</h2>

      @if (error()) {
        <div class="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
          {{ error() }}
        </div>
      }

      <form (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink mb-1">Name</label>
          <input
            type="text"
            [(ngModel)]="name"
            name="name"
            required
            placeholder="Your name"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
          @if (email() && !emailValid()) {
            <p class="mt-1 text-xs text-danger">Enter a valid email address</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1">Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            minlength="8"
            placeholder="At least 8 characters"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
          @if (password() && password().length < 8) {
            <p class="mt-1 text-xs text-danger">Must be at least 8 characters</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-ink mb-1">Confirm Password</label>
          <input
            type="password"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required
            placeholder="Repeat password"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
          />
          @if (confirmPassword() && password() !== confirmPassword()) {
            <p class="mt-1 text-xs text-danger">Passwords do not match</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="loading() || !formValid()"
          class="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          @if (loading()) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Creating account...
          } @else {
            Create Account
          }
        </button>
      </form>

      <p class="text-center text-sm text-ink-muted">
        Already have an account?
        <a routerLink="/login" class="text-primary hover:underline font-medium">Sign in</a>
      </p>
    </div>
  `,
})
export class RegisterPage {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  error = signal('');

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email());
  }

  formValid(): boolean {
    return (
      !!this.name() &&
      this.emailValid() &&
      this.password().length >= 8 &&
      this.password() === this.confirmPassword()
    );
  }

  async submit(): Promise<void> {
    if (!this.formValid()) {
      this.error.set('Please fix the form errors above');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await this.auth.register({
        name: this.name(),
        email: this.email(),
        password: this.password(),
        timezone,
      }).toPromise();
      this.router.navigateByUrl('/dashboard');
    } catch (err: any) {
      this.error.set(err?.error?.message || err?.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
