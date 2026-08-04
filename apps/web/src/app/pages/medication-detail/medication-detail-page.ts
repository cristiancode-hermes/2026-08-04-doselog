import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MedicationsService } from '../../services/medications.service';
import { SchedulesService } from '../../services/schedules.service';
import { RefillsService } from '../../services/refills.service';
import { Medication, Schedule, Refill, SupplyStatus } from '../../models';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { ErrorBanner } from '../../shared/components/error-banner';
import { EmptyState } from '../../shared/components/empty-state';
import { ProgressBar } from '../../shared/components/progress-bar';
import { ScheduleModal } from '../../shared/components/schedule-modal';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';

@Component({
  selector: 'app-medication-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    LoadingSkeleton,
    ErrorBanner,
    EmptyState,
    ProgressBar,
    ScheduleModal,
    ConfirmDialog,
  ],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Back -->
      <a routerLink="/medications" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4 transition-colors">
        ← Back to Medications
      </a>

      @if (error()) {
        <app-error-banner [message]="error()" (retry)="loadData()" class="mb-4 block" />
      }

      @if (loading()) {
        <app-loading-skeleton type="card" [count]="3" />
      }

      @if (!loading() && medication(); as med) {
        <!-- Header Info -->
        <div class="rounded-xl border border-border bg-surface p-6 mb-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-ink">{{ med.name }}</h1>
              <p class="text-ink-muted mt-1">
                {{ med.dosage }}{{ med.unit }} · {{ med.form }}
                @if (med.activeIngredient) {
                  · {{ med.activeIngredient }}
                }
              </p>
            </div>
            <a
              [routerLink]="['/medications', med.id, 'edit']"
              class="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-bg transition-colors"
            >
              Edit
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            @if (stats(); as s) {
              <div class="text-center">
                <div class="text-2xl font-bold text-ink">{{ s.adherence }}%</div>
                <div class="text-xs text-ink-muted">Adherence</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-ink">🔥 {{ s.streak }}</div>
                <div class="text-xs text-ink-muted">Day Streak</div>
              </div>
            }
            @if (supplyStatus(); as supply) {
              <div class="text-center">
                <div class="text-2xl font-bold" [class.text-success]="!supply.alert" [class.text-warning]="supply.alert">
                  {{ supply.remaining }}
                </div>
                <div class="text-xs text-ink-muted">Remaining</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold" [class.text-success]="!supply.alert" [class.text-warning]="supply.alert">
                  {{ supply.daysLeft }}d
                </div>
                <div class="text-xs text-ink-muted">Days Left</div>
              </div>
            }
          </div>

          @if (supplyStatus(); as supply) {
            <div class="mt-4">
              <app-progress-bar
                [percent]="supply.remaining > 0 ? Math.min(100, (supply.daysLeft / supply.threshold) * 100) : 0"
                [color]="supply.alert ? 'warning' : 'success'"
                label="Supply"
              />
            </div>
          }
        </div>

        <!-- Schedules -->
        <div class="rounded-xl border border-border bg-surface p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ink">Schedules</h2>
            <button
              (click)="showScheduleModal.set(true)"
              class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
            >
              + Add Schedule
            </button>
          </div>

          @if (schedules().length === 0) {
            <p class="text-sm text-ink-muted py-4 text-center">No schedules yet</p>
          } @else {
            <div class="space-y-2">
              @for (sched of schedules(); track sched.id) {
                <div class="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <span class="text-sm font-medium text-ink capitalize">{{ sched.type }}</span>
                    @if (sched.type === 'daily') {
                      <span class="text-sm text-ink-muted ml-2">
                        {{ sched.times.length }}×/day
                      </span>
                    }
                    @if (sched.type === 'weekly') {
                      <span class="text-sm text-ink-muted ml-2">
                        {{ sched.daysOfWeek?.length || 0 }} days/week
                      </span>
                    }
                    @if (sched.type === 'prn') {
                      <span class="text-sm text-ink-muted ml-2">
                        Max {{ sched.maxPerDay }}/day
                      </span>
                    }
                  </div>
                  <button
                    (click)="deleteSchedule(sched)"
                    class="text-xs text-danger hover:text-danger/80 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Refill Summary -->
        <div class="rounded-xl border border-border bg-surface p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-ink">Refills</h2>
            <a
              [routerLink]="['/medications', med.id, 'refills']"
              class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-bg transition-colors"
            >
              View All
            </a>
          </div>

          @if (refills().length === 0) {
            <p class="text-sm text-ink-muted py-4 text-center">No refills logged</p>
          } @else {
            <div class="space-y-2">
              @for (refill of refills().slice(0, 3); track refill.id) {
                <div class="flex items-center justify-between py-2 border-b border-divider last:border-0">
                  <span class="text-sm text-ink">{{ refill.fillDate | date: 'MMM d, yyyy' }}</span>
                  <span class="text-sm text-ink-muted">{{ refill.quantity }} units</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Adherence Trend -->
        <div class="rounded-xl border border-border bg-surface p-6">
          <h2 class="text-lg font-semibold text-ink mb-4">Adherence Trend</h2>
          <div class="flex gap-4">
            @if (adherenceTrends(); as trends) {
              <div class="flex-1 text-center">
                <div class="text-xl font-bold text-ink">{{ trends['7'] ?? stats()?.adherence ?? 0 }}%</div>
                <div class="text-xs text-ink-muted">7 Days</div>
                <div class="mt-2 h-2 rounded-full bg-bg overflow-hidden">
                  <div class="h-full rounded-full bg-success transition-all" [style.width.%]="trends['7'] ?? stats()?.adherence ?? 0"></div>
                </div>
              </div>
              <div class="flex-1 text-center">
                <div class="text-xl font-bold text-ink">{{ trends['30'] ?? stats()?.adherence ?? 0 }}%</div>
                <div class="text-xs text-ink-muted">30 Days</div>
                <div class="mt-2 h-2 rounded-full bg-bg overflow-hidden">
                  <div class="h-full rounded-full bg-warning transition-all" [style.width.%]="trends['30'] ?? stats()?.adherence ?? 0"></div>
                </div>
              </div>
              <div class="flex-1 text-center">
                <div class="text-xl font-bold text-ink">{{ trends['90'] ?? stats()?.adherence ?? 0 }}%</div>
                <div class="text-xs text-ink-muted">90 Days</div>
                <div class="mt-2 h-2 rounded-full bg-bg overflow-hidden">
                  <div class="h-full rounded-full bg-danger transition-all" [style.width.%]="trends['90'] ?? stats()?.adherence ?? 0"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <app-schedule-modal
        [visible]="showScheduleModal()"
        [medicationId]="medication()?.id || null"
        (saved)="onScheduleSaved($event)"
        (cancelled)="showScheduleModal.set(false)"
      />

      <app-confirm-dialog
        [visible]="showDeleteConfirm()"
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule?"
        confirmLabel="Delete"
        [danger]="true"
        (confirm)="confirmDeleteSchedule()"
        (cancel)="showDeleteConfirm.set(false)"
      />
    </div>
  `,
})
export class MedicationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private medicationsService = inject(MedicationsService);
  private schedulesService = inject(SchedulesService);
  private refillsService = inject(RefillsService);

  readonly Math = Math;

  readonly medication = signal<Medication | null>(null);
  readonly stats = signal<{ adherence: number; streak: number; totalDoses: number; takenDoses: number } | null>(null);
  readonly schedules = signal<Schedule[]>([]);
  readonly refills = signal<Refill[]>([]);
  readonly supplyStatus = signal<SupplyStatus | null>(null);
  readonly adherenceTrends = signal<Record<string, number> | null>(null);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly showScheduleModal = signal(false);
  readonly showDeleteConfirm = signal(false);

  private scheduleToDelete: Schedule | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.medicationsService.getById(id).toPromise(),
      this.medicationsService.getStats(id).toPromise(),
      this.schedulesService.getByMedication(id).toPromise(),
      this.refillsService.getByMedication(id).toPromise(),
      this.refillsService.getSupply(id).toPromise(),
    ])
      .then(([med, stats, scheds, refills, supply]) => {
        this.medication.set(med || null);
        this.stats.set(stats || null);
        this.schedules.set(scheds || []);
        this.refills.set(refills || []);
        this.supplyStatus.set(supply || null);
      })
      .catch((err) => {
        this.error.set(err?.message || 'Failed to load medication details');
      })
      .finally(() => this.loading.set(false));
  }

  onScheduleSaved(data: any): void {
    const medId = this.medication()?.id;
    if (!medId) return;

    this.schedulesService.create(medId, data).subscribe({
      next: () => {
        this.showScheduleModal.set(false);
        this.schedulesService.getByMedication(medId).subscribe((s) => this.schedules.set(s));
      },
      error: (err) => this.error.set(err?.message || 'Failed to create schedule'),
    });
  }

  deleteSchedule(sched: Schedule): void {
    this.scheduleToDelete = sched;
    this.showDeleteConfirm.set(true);
  }

  confirmDeleteSchedule(): void {
    if (!this.scheduleToDelete) return;
    this.schedulesService.delete(this.scheduleToDelete.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.scheduleToDelete = null;
        const medId = this.medication()?.id;
        if (medId) {
          this.schedulesService.getByMedication(medId).subscribe((s) => this.schedules.set(s));
        }
      },
      error: (err) => this.error.set(err?.message || 'Failed to delete schedule'),
    });
  }
}
