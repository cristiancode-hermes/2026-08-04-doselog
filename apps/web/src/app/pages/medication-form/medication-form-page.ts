import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicationsService } from '../../services/medications.service';
import { Medication } from '../../models';
import { ScheduleModal } from '../../shared/components/schedule-modal';
import { ErrorBanner } from '../../shared/components/error-banner';

@Component({
  selector: 'app-medication-form-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ScheduleModal, ErrorBanner],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/medications" class="text-ink-muted hover:text-ink transition-colors">
          ← Back
        </a>
        <h1 class="text-2xl font-bold text-ink">
          {{ isEdit() ? 'Edit' : 'Add' }} Medication
        </h1>
      </div>

      @if (error()) {
        <app-error-banner [message]="error()" (retry)="() => error.set('')" class="mb-4 block" />
      }

      <form (ngSubmit)="submit()" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-ink mb-1">Name *</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="e.g. Metformin"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-ink mb-1">Active Ingredient</label>
            <input
              type="text"
              [(ngModel)]="activeIngredient"
              name="activeIngredient"
              placeholder="e.g. Metformin HCl"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1">Dosage *</label>
            <input
              type="number"
              [(ngModel)]="dosage"
              name="dosage"
              required
              min="0"
              step="0.5"
              placeholder="500"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1">Unit *</label>
            <select
              [(ngModel)]="unit"
              name="unit"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
            >
              <option value="mg">mg</option>
              <option value="mcg">mcg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="IU">IU</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1">Form *</label>
            <select
              [(ngModel)]="form"
              name="form"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
            >
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="liquid">Liquid</option>
              <option value="injection">Injection</option>
              <option value="inhaler">Inhaler</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1">Total Quantity</label>
            <input
              type="number"
              [(ngModel)]="totalQuantity"
              name="totalQuantity"
              min="0"
              placeholder="90"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1">Refill Threshold (days)</label>
            <input
              type="number"
              [(ngModel)]="refillThreshold"
              name="refillThreshold"
              min="1"
              placeholder="7"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-ink mb-1">Notes</label>
            <textarea
              [(ngModel)]="notes"
              name="notes"
              rows="3"
              placeholder="Optional notes..."
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-subtle focus:border-border-focus focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-4">
          <button
            type="submit"
            [disabled]="saving() || !name() || !dosage() || !unit() || !form()"
            class="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            @if (saving()) {
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            }
            {{ isEdit() ? 'Save Changes' : 'Add Medication' }}
          </button>

          @if (!isEdit() && savedMedicationId()) {
            <button
              type="button"
              (click)="showScheduleModal.set(true)"
              class="rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              + Add Schedule
            </button>
          }
        </div>
      </form>

      <app-schedule-modal
        [visible]="showScheduleModal()"
        [medicationId]="savedMedicationId()"
        (saved)="onScheduleSaved($event)"
        (cancelled)="showScheduleModal.set(false)"
      />
    </div>
  `,
})
export class MedicationFormPage implements OnInit {
  private medicationsService = inject(MedicationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isEdit = signal(false);
  readonly medicationId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly savedMedicationId = signal<string | null>(null);
  readonly showScheduleModal = signal(false);

  name = signal('');
  activeIngredient = signal('');
  dosage = signal(0);
  unit = signal('mg');
  form = signal('tablet');
  totalQuantity = signal(0);
  refillThreshold = signal(7);
  notes = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.medicationId.set(id);
      this.loadMedication(id);
    }
  }

  loadMedication(id: string): void {
    this.medicationsService.getById(id).subscribe({
      next: (med) => {
        this.name.set(med.name);
        this.activeIngredient.set(med.activeIngredient || '');
        this.dosage.set(med.dosage);
        this.unit.set(med.unit);
        this.form.set(med.form);
        this.totalQuantity.set(med.totalQuantity || 0);
        this.refillThreshold.set(med.refillThreshold);
        this.notes.set(med.notes || '');
      },
      error: (err) => this.error.set(err?.message || 'Failed to load medication'),
    });
  }

  submit(): void {
    if (!this.name() || !this.dosage() || !this.unit() || !this.form()) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const data = {
      name: this.name(),
      activeIngredient: this.activeIngredient() || undefined,
      dosage: this.dosage(),
      unit: this.unit(),
      form: this.form(),
      totalQuantity: this.totalQuantity() || undefined,
      refillThreshold: this.refillThreshold(),
      notes: this.notes() || undefined,
    };

    const obs = this.isEdit()
      ? this.medicationsService.update(this.medicationId()!, data)
      : this.medicationsService.create(data);

    obs.subscribe({
      next: (med) => {
        if (!this.isEdit()) {
          this.savedMedicationId.set(med.id);
        } else {
          this.router.navigateByUrl(`/medications/${med.id}`);
        }
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to save medication');
        this.saving.set(false);
      },
    });
  }

  onScheduleSaved(_schedule: any): void {
    this.showScheduleModal.set(false);
    this.router.navigateByUrl(`/medications/${this.savedMedicationId()}`);
  }
}
