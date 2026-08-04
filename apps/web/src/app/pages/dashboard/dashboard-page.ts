import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DosesService } from '../../services/doses.service';
import { StatsService } from '../../services/stats.service';
import { DoseWithMedication, Overview, AdherenceDay } from '../../models';
import { DoseCard } from '../../shared/components/dose-card';
import { StatusBadge } from '../../shared/components/status-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state';
import { ErrorBanner } from '../../shared/components/error-banner';
import { ProgressBar } from '../../shared/components/progress-bar';

interface TimeWindow {
  label: string;
  icon: string;
  doses: DoseWithMedication[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DoseCard,
    StatusBadge,
    LoadingSkeleton,
    EmptyState,
    ErrorBanner,
    ProgressBar,
  ],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Error -->
      @if (error()) {
        <app-error-banner [message]="error()" (retry)="loadData()" class="mb-4 block" />
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <app-loading-skeleton type="card" [count]="4" />
          </div>
          <div class="space-y-4">
            <app-loading-skeleton type="card" [count]="3" />
          </div>
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Today's Doses -->
          <div class="lg:col-span-2 space-y-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-ink">Today</h2>
                <span class="text-sm text-ink-muted">{{ today | date: 'EEEE, MMM d' }}</span>
              </div>

              @if (allDoses().length === 0) {
                @if (hasMedications()) {
                  <app-empty-state
                    icon="🎉"
                    title="All caught up!"
                    message="Everything taken for today."
                  />
                } @else {
                  <app-empty-state
                    icon="💊"
                    title="No medications yet"
                    message="Add your first medication to start tracking."
                    actionLabel="Add Medication"
                    (action)="navigateToAdd()"
                  />
                }
              } @else {
                @for (window of timeWindows(); track window.label) {
                  @if (window.doses.length > 0) {
                    <div class="mb-4">
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-lg">{{ window.icon }}</span>
                        <h3 class="text-sm font-semibold text-ink-muted uppercase tracking-wider">
                          {{ window.label }}
                        </h3>
                        <div class="flex-1 h-px bg-divider"></div>
                      </div>
                      <div class="space-y-3">
                        @for (dose of window.doses; track dose.id) {
                          <app-dose-card
                            [dose]="dose"
                            (taken)="takeDose($event)"
                            (skipped)="skipDose($event)"
                          />
                        }
                      </div>
                    </div>
                  }
                }
              }
            </div>
          </div>

          <!-- Right: Stats & Summary -->
          <div class="space-y-6">
            <!-- Summary Card -->
            @if (overview(); as ov) {
              <div class="rounded-xl border border-border bg-surface p-4">
                <h3 class="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">Summary</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-ink-muted">Today's Progress</span>
                    <span class="text-sm font-medium text-ink">{{ ov.todayProgress.taken }}/{{ ov.todayProgress.total }}</span>
                  </div>
                  <app-progress-bar [percent]="ov.todayProgress.percent" [color]="ov.todayProgress.percent >= 80 ? 'success' : ov.todayProgress.percent >= 50 ? 'warning' : 'danger'" />

                  <div class="flex items-center justify-between pt-2 border-t border-divider">
                    <span class="text-sm text-ink-muted">Week Adherence</span>
                    <span class="text-sm font-medium text-ink">{{ ov.weekAdherence }}%</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm text-ink-muted">Current Streak</span>
                    <span class="text-sm font-medium text-ink">🔥 {{ ov.streak }} days</span>
                  </div>
                </div>
              </div>
            }

            <!-- Week Adherence -->
            @if (weekData().length > 0) {
              <div class="rounded-xl border border-border bg-surface p-4">
                <h3 class="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">This Week</h3>
                <div class="flex items-end justify-between gap-1 h-24">
                  @for (day of weekData(); track day.date) {
                    <div class="flex flex-col items-center gap-1 flex-1">
                      <div
                        class="w-full rounded-t transition-all duration-500"
                        [style.height.%]="day.adherence"
                        [class.bg-success]="day.adherence >= 80"
                        [class.bg-warning]="day.adherence >= 50 && day.adherence < 80"
                        [class.bg-danger]="day.adherence > 0 && day.adherence < 50"
                        [class.bg-ink-subtle/30]="day.adherence === 0"
                        style="min-height: 4px"
                      ></div>
                      <span class="text-xs text-ink-muted">{{ day.date | date: 'E' }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Refill Alerts -->
            @if (refillAlerts().length > 0) {
              <div class="rounded-xl border border-border bg-surface p-4">
                <h3 class="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">Refill Alerts</h3>
                <div class="space-y-2">
                  @for (alert of refillAlerts(); track alert.medicationName) {
                    <div class="flex items-center justify-between py-1">
                      <span class="text-sm text-ink">{{ alert.medicationName }}</span>
                      <span class="text-xs font-medium text-warning">{{ alert.daysLeft }} days left</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private dosesService = inject(DosesService);
  private statsService = inject(StatsService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly doses = signal<DoseWithMedication[]>([]);
  readonly overview = signal<Overview | null>(null);
  readonly weekData = signal<AdherenceDay[]>([]);
  readonly hasMedications = signal(false);

  readonly today = new Date();

  readonly refillAlerts = signal<{ medicationName: string; daysLeft: number }[]>([]);

  get allDoses() {
    return this.doses;
  }

  get timeWindows() {
    return () => this.computeWindows();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.dosesService.getToday().toPromise(),
      this.statsService.getOverview().toPromise(),
      this.statsService.getWeek().toPromise(),
    ])
      .then(([doses, overview, week]) => {
        this.doses.set(doses || []);
        this.overview.set(overview || null);
        this.weekData.set(week || []);
        this.hasMedications.set((doses || []).some((d) => d.medication) || (overview?.todayProgress.total ?? 0) > 0);
        this.refillAlerts.set(overview?.refillAlerts || []);
      })
      .catch((err) => {
        this.error.set(err?.message || 'Failed to load dashboard data');
      })
      .finally(() => this.loading.set(false));
  }

  private computeWindows(): TimeWindow[] {
    const doses = this.doses();
    const windows: TimeWindow[] = [
      { label: 'Morning', icon: '🌅', doses: [] },
      { label: 'Afternoon', icon: '☀️', doses: [] },
      { label: 'Evening', icon: '🌆', doses: [] },
      { label: 'Night', icon: '🌙', doses: [] },
    ];

    const getHour = (d: DoseWithMedication): number => {
      if (d.scheduledTime) {
        return new Date(d.scheduledTime).getHours();
      }
      const hour = new Date(d.takenTime).getHours();
      return hour;
    };

    for (const dose of doses) {
      const hour = getHour(dose);
      if (hour >= 5 && hour <= 11) {
        windows[0].doses.push(dose);
      } else if (hour >= 12 && hour <= 16) {
        windows[1].doses.push(dose);
      } else if (hour >= 17 && hour <= 20) {
        windows[2].doses.push(dose);
      } else {
        windows[3].doses.push(dose);
      }
    }

    return windows;
  }

  takeDose(dose: DoseWithMedication): void {
    this.dosesService.update(dose.id, { status: 'taken' }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err?.message || 'Failed to log dose'),
    });
  }

  skipDose(dose: DoseWithMedication): void {
    this.dosesService.update(dose.id, { status: 'skipped' }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err?.message || 'Failed to skip dose'),
    });
  }

  navigateToAdd(): void {
    // Will use router
  }
}
