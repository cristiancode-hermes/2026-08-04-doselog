import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DoseWithMedication } from '../../models';
import { StatusBadge } from './status-badge';

@Component({
  selector: 'app-dose-card',
  standalone: true,
  imports: [DatePipe, StatusBadge],
  template: `
    <div
      class="flex items-center gap-4 rounded-xl border p-4 transition-all"
      [class.border-success/20]="status() === 'taken'"
      [class.border-warning/20]="status() === 'late'"
      [class.border-danger/20]="status() === 'missed'"
      [class.border-ink-subtle/20]="status() === 'skipped' || status() === 'upcoming'"
      [class.bg-success/5]="status() === 'taken'"
      [class.bg-warning/5]="status() === 'late'"
      [class.bg-danger/5]="status() === 'missed'"
      [class.bg-surface]="status() === 'skipped' || status() === 'upcoming'"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <app-status-badge [status]="status()" />
          <h3 class="font-medium text-ink truncate">
            {{ dose().medication?.name || 'Unknown' }}
          </h3>
        </div>
        <p class="text-sm text-ink-muted mt-1">
          {{ dose().medication?.dosage }}{{ dose().medication?.unit }}
          @if (dose().medication?.form) {
            · {{ dose().medication?.form }}
          }
          @if (dose().scheduledTime) {
            · {{ dose().scheduledTime | date: 'h:mm a' }}
          }
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        @if (status() === 'upcoming') {
          <button
            (click)="taken.emit(dose())"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Take
          </button>
          <button
            (click)="skipped.emit(dose())"
            class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-bg transition-colors"
          >
            Skip
          </button>
        }
        @if (status() === 'late') {
          <button
            (click)="taken.emit(dose())"
            class="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white hover:bg-warning/80 transition-colors"
          >
            Take Now
          </button>
        }
      </div>
    </div>
  `,
})
export class DoseCard {
  readonly dose = input.required<DoseWithMedication>();
  readonly taken = output<DoseWithMedication>();
  readonly skipped = output<DoseWithMedication>();

  status(): string {
    return this.dose().status || 'upcoming';
  }
}
