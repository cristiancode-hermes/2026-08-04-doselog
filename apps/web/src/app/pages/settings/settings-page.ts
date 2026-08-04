import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { ErrorBanner } from '../../shared/components/error-banner';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import type { UserSettings } from '../../models';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, ErrorBanner, LoadingSkeleton, ConfirmDialog],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your profile and preferences</p>
      </div>
    </div>

    @if (loading()) {
      <div class="settings-loading">
        <app-loading-skeleton [count]="4" type="card" />
      </div>
    } @else if (error()) {
      <app-error-banner [message]="error()" (retry)="loadSettings()" />
    } @else {
      <form (ngSubmit)="saveProfile()" class="settings-form">
        <!-- Profile Section -->
        <section class="settings-section">
          <h2 class="section-title">Profile</h2>
          <div class="form-group">
            <label class="form-label">Name</label>
            <input class="form-input" [(ngModel)]="profile.name" name="name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" [(ngModel)]="profile.email" name="email" required />
          </div>
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <input class="form-input" [(ngModel)]="profile.timezone" name="timezone" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Save Profile' }}
          </button>
          @if (saveMessage()) {
            <p class="save-message">{{ saveMessage() }}</p>
          }
        </section>

        <!-- Notification Preferences -->
        <section class="settings-section">
          <h2 class="section-title">Notification Preferences</h2>
          <div class="toggle-row">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="prefs.notifyAtDoseTime" name="notifyAtDoseTime" />
              Remind me at scheduled time
            </label>
          </div>
          <div class="toggle-row">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="prefs.notifyBefore15min" name="notifyBefore15min" />
              Remind 15 minutes before
            </label>
          </div>
          <div class="toggle-row">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="prefs.notifyDailySummary" name="notifyDailySummary" />
              Daily summary at 9PM
            </label>
          </div>
          <div class="toggle-row">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="prefs.notifyRefill" name="notifyRefill" />
              Refill reminders
            </label>
          </div>
          <div class="toggle-row">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="prefs.notifyMissedDose" name="notifyMissedDose" />
              Missed dose alerts
            </label>
          </div>
        </section>

        <!-- Theme -->
        <section class="settings-section">
          <h2 class="section-title">Display</h2>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" [(ngModel)]="prefs.theme" name="theme" value="light" />
              Light
            </label>
            <label class="radio-label">
              <input type="radio" [(ngModel)]="prefs.theme" name="theme" value="dark" />
              Dark
            </label>
            <label class="radio-label">
              <input type="radio" [(ngModel)]="prefs.theme" name="theme" value="system" />
              System
            </label>
          </div>
          <button type="button" class="btn btn-primary" (click)="savePreferences()" [disabled]="savingPrefs()">
            {{ savingPrefs() ? 'Saving...' : 'Save Preferences' }}
          </button>
        </section>

        <!-- Danger Zone -->
        <section class="settings-section danger-zone">
          <h2 class="section-title">Danger Zone</h2>
          <p class="danger-text">Delete your account and all associated data. This action cannot be undone.</p>
          <button type="button" class="btn btn-danger" (click)="showDeleteConfirm.set(true)">
            Delete Account
          </button>
        </section>
      </form>
    }

    <app-confirm-dialog
      [visible]="showDeleteConfirm()"
      title="Delete Account"
      message="Are you sure you want to delete your account? All medications, dose records, and refill data will be permanently removed."
      confirmLabel="DELETE"
      [danger]="true"
      (confirm)="deleteAccount()"
      (cancel)="showDeleteConfirm.set(false)"
    />
  `,
  styles: [`
    .settings-form { max-width: 600px; }
    .settings-section { margin-bottom: 32px; padding: 24px; background: var(--color-surface, #fff); border-radius: 8px; border: 1px solid var(--color-border, #e5e7eb); }
    .section-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: var(--color-ink, #171a19); }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 4px; color: var(--color-ink-muted, #4b5563); }
    .form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--color-border, #e5e7eb); border-radius: 6px; font-size: 0.875rem; background: var(--color-surface, #fff); color: var(--color-ink, #171a19); }
    .form-input:focus { outline: none; border-color: var(--color-primary, #0d7c6e); box-shadow: 0 0 0 3px rgba(13,124,110,0.1); }
    .btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-primary { background: var(--color-primary, #0d7c6e); color: white; }
    .btn-primary:hover { background: #0a6358; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger { background: var(--color-danger, #ef4444); color: white; }
    .btn-danger:hover { background: #dc2626; }
    .save-message { margin-top: 8px; font-size: 0.875rem; color: var(--color-success, #10b981); }
    .toggle-row { padding: 8px 0; border-bottom: 1px solid var(--color-divider, #f0f1f0); }
    .toggle-label { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--color-ink, #171a19); cursor: pointer; }
    .radio-group { display: flex; gap: 16px; margin-bottom: 16px; }
    .radio-label { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-ink, #171a19); cursor: pointer; }
    .danger-zone { border-color: var(--color-danger, #ef4444); }
    .danger-text { font-size: 0.875rem; color: var(--color-ink-muted, #4b5563); margin-bottom: 12px; }
    .settings-loading { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 1.5rem; font-weight: 600; color: var(--color-ink, #171a19); margin: 0; }
    .page-subtitle { font-size: 0.875rem; color: var(--color-ink-muted, #4b5563); margin: 4px 0 0 0; }
  `]
})
export class SettingsPageComponent implements OnInit {
  private auth = inject(AuthService);
  private settingsSvc = inject(SettingsService);
  private router = inject(Router);

  protected loading = signal(true);
  protected error = signal('');
  protected saving = signal(false);
  protected savingPrefs = signal(false);
  protected saveMessage = signal('');
  protected showDeleteConfirm = signal(false);
  protected profile = { name: '', email: '', timezone: '' };
  protected prefs: UserSettings = {
    theme: 'system',
    notifyAtDoseTime: true,
    notifyBefore15min: false,
    notifyDailySummary: false,
    notifyRefill: true,
    notifyMissedDose: true,
  };

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.loading.set(true);
    this.error.set('');
    try {
      const user = await lastValueFrom(this.auth.getProfile());
      if (user) {
        this.profile.name = user.name || '';
        this.profile.email = user.email || '';
        this.profile.timezone = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      try {
        const s = await lastValueFrom(this.settingsSvc.get());
        if (s) this.prefs = { ...this.prefs, ...s };
      } catch { }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load settings');
    } finally {
      this.loading.set(false);
    }
  }

  protected async saveProfile() {
    this.saving.set(true);
    this.saveMessage.set('');
    try {
      await lastValueFrom(this.auth.updateProfile(this.profile));
      this.saveMessage.set('Profile saved successfully');
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to save profile');
    } finally {
      this.saving.set(false);
    }
  }

  protected async savePreferences() {
    this.savingPrefs.set(true);
    try {
      await lastValueFrom(this.settingsSvc.update(this.prefs));
      this.saveMessage.set('Preferences saved');
    } catch { } finally {
      this.savingPrefs.set(false);
    }
  }

  protected async deleteAccount() {
    try {
      await lastValueFrom(this.auth.deleteAccount());
      localStorage.removeItem('doselog-token');
      this.router.navigate(['/login']);
    } catch { }
  }
}
