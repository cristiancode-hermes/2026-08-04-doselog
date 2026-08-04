import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RefillsService } from '../../services/refills.service';
import { Refill, SupplyStatus } from '../../models';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { ErrorBanner } from '../../shared/components/error-banner';
import { EmptyState } from '../../shared/components/empty-state';
import { ProgressBar } from '../../shared/components/progress-bar';
import { RefillModal } from '../../shared/components/refill-modal';

@Component({
  selector: 'app-refill-log-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    LoadingSkeleton,
    ErrorBanner,
    EmptyState,
    ProgressBar,
    RefillModal,
  ],
  template: `
    <div class="max-w-4xl mx-auto">
      <a [routerLink]="['/medications', medicationId()]" class="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4 transition-colors">
        ← Back to Medication
      </a>

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-ink">Refill Log</h1>
        <button
          (click)="showRefillModal.set(true)"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          + Add Refill
        </button>
      </div>

      @if (error()) {
        <app-error-banner [message]="error()" (retry)="loadData()" class="mb-4 block" />
      }

      @if (loading()) {
        <app-loading-skeleton type="card" [count]="3" />
      }

      @if (!loading()) {
        <!-- Supply Status -->
        @if (supplyStatus(); as supply) {
          <div class="rounded-xl border border-border bg-surface p-4 mb-6">
            <h2 class="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">Supply Status</h2>
            <div class="grid grid-cols-3 gap-4 mb-3">
              <div class="text-center">
                <div class="text-xl font-bold text-ink">{{ supply.remaining }}</div>
                <div class="text-xs text-ink-muted">Remaining</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold" [class.text-success]="!supply.alert" [class.text-warning]="supply.alert">
                  {{ supply.daysLeft }}d
                </div>
                <div class="text-xs text-ink-muted">Days Left</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-bold" [class.text-success]="!supply.alert" [class.text-danger]="supply.alert">
                  {{ supply.threshold }}d
                </div>
                <div class="text-xs text-ink-muted">Threshold</div>
              </div>
            </div>
            <app-progress-bar
              [percent]="Math.min(100, (supply.daysLeft / supply.threshold) * 100)"
              [color]="supply.alert ? 'danger' : 'success'"
            />
          </div>
        }

        <!-- Refill History -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <h2 class="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">Refill History</h2>

          @if (refills().length === 0) {
            <app-empty-state
              icon="📦"
              title="No refills yet"
              message="Log your first refill to start tracking supply."
            />
          } @else {
            <div class="space-y-1">
              @for (refill of refills(); track refill.id) {
                <div class="flex items-center justify-between py-3 border-b border-divider last:border-0">
                  <div>
                    <span class="text-sm font-medium text-ink">{{ refill.fillDate | date: 'MMM d, yyyy' }}</span>
                    @if (refill.lotNumber) {
                      <span class="text-xs text-ink-muted ml-2">Lot: {{ refill.lotNumber }}</span>
                    }
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-ink-muted">{{ refill.quantity }} units</span>
                    <button
                      (click)="deleteRefill(refill)"
                      class="text-xs text-danger hover:text-danger/80 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <app-refill-modal
        [visible]="showRefillModal()"
        [medicationId]="medicationId()"
        (saved)="onRefillSaved($event)"
        (cancelled)="showRefillModal.set(false)"
      />
    </div>
  `,
})
export class RefillLogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private refillsService = inject(RefillsService);

  readonly Math = Math;

  readonly medicationId = signal<string>('');
  readonly refills = signal<Refill[]>([]);
  readonly supplyStatus = signal<SupplyStatus | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showRefillModal = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medicationId.set(id);
      this.loadData();
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.refillsService.getByMedication(this.medicationId()).toPromise(),
      this.refillsService.getSupply(this.medicationId()).toPromise(),
    ])
      .then(([refills, supply]) => {
        this.refills.set((refills || []).reverse());
        this.supplyStatus.set(supply || null);
      })
      .catch((err) => {
        this.error.set(err?.message || 'Failed to load refill data');
      })
      .finally(() => this.loading.set(false));
  }

  onRefillSaved(_data: any): void {
    this.showRefillModal.set(false);
    this.loadData();
  }

  deleteRefill(refill: Refill): void {
    if (confirm('Delete this refill record?')) {
      this.refillsService.delete(refill.id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.error.set(err?.message || 'Failed to delete refill'),
      });
    }
  }
}
