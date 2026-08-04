import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MedicationsService } from '../../services/medications.service';
import { Medication } from '../../models';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state';
import { ErrorBanner } from '../../shared/components/error-banner';

@Component({
  selector: 'app-medication-list-page',
  standalone: true,
  imports: [RouterLink, LoadingSkeleton, EmptyState, ErrorBanner],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-ink">Medications</h1>
        <a
          routerLink="/medications/new"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          + Add
        </a>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6">
        <button
          (click)="showArchived.set(false); loadMedications()"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class.bg-primary/10]="!showArchived()"
          [class.text-primary]="!showArchived()"
          [class.text-ink-muted]="showArchived()"
          [class.hover:bg-bg]="showArchived()"
        >
          Active
        </button>
        <button
          (click)="showArchived.set(true); loadMedications()"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class.bg-primary/10]="showArchived()"
          [class.text-primary]="showArchived()"
          [class.text-ink-muted]="!showArchived()"
          [class.hover:bg-bg]="!showArchived()"
        >
          Archived
        </button>
      </div>

      <!-- Error -->
      @if (error()) {
        <app-error-banner [message]="error()" (retry)="loadMedications()" class="mb-4 block" />
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-4">
          <app-loading-skeleton type="card" [count]="5" />
        </div>
      }

      <!-- Empty -->
      @if (!loading() && !error() && medications().length === 0) {
        <app-empty-state
          icon="💊"
          [title]="showArchived() ? 'No archived medications' : 'No medications yet'"
          [message]="showArchived() ? 'Archived medications will appear here.' : 'Add your first medication to start tracking.'"
          [actionLabel]="showArchived() ? '' : 'Add Medication'"
          (action)="navigateToAdd()"
        />
      }

      <!-- List -->
      @if (!loading() && medications().length > 0) {
        <div class="space-y-3">
          @for (med of medications(); track med.id) {
            <div class="rounded-xl border border-border bg-surface p-4 hover:shadow-sm transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/medications', med.id]" class="text-lg font-semibold text-ink hover:text-primary transition-colors">
                    {{ med.name }}
                  </a>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="text-sm text-ink-muted">{{ med.dosage }}{{ med.unit }}</span>
                    <span class="text-sm text-ink-subtle">·</span>
                    <span class="text-sm text-ink-muted capitalize">{{ med.form }}</span>
                    @if (med.activeIngredient) {
                      <span class="text-sm text-ink-subtle">·</span>
                      <span class="text-sm text-ink-muted">{{ med.activeIngredient }}</span>
                    }
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-4">
                  <a
                    [routerLink]="['/medications', med.id, 'edit']"
                    class="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-bg transition-colors"
                  >
                    Edit
                  </a>
                  <button
                    (click)="archiveMedication(med)"
                    class="rounded-lg px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/5 transition-colors"
                  >
                    {{ showArchived() ? 'Restore' : 'Archive' }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MedicationListPage implements OnInit {
  private medicationsService = inject(MedicationsService);
  private router = inject(Router);

  readonly medications = signal<Medication[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showArchived = signal(false);

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.loading.set(true);
    this.error.set('');

    const obs = this.showArchived()
      ? this.medicationsService.getArchived()
      : this.medicationsService.getAll();

    obs.subscribe({
      next: (meds) => {
        this.medications.set(meds);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load medications');
        this.loading.set(false);
      },
    });
  }

  archiveMedication(med: Medication): void {
    if (this.showArchived()) {
      this.medicationsService.unarchive(med.id).subscribe({
        next: () => this.loadMedications(),
        error: (err) => this.error.set(err?.message || 'Failed to restore medication'),
      });
    } else {
      this.medicationsService.delete(med.id).subscribe({
        next: () => this.loadMedications(),
        error: (err) => this.error.set(err?.message || 'Failed to archive medication'),
      });
    }
  }

  navigateToAdd(): void {
    this.router.navigateByUrl('/medications/new');
  }
}
