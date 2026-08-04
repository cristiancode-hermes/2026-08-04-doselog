import { Component, input, output, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Refill } from '../../models';

@Component({
  selector: 'app-refill-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" (click)="cancelled.emit()"></div>
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-ink mb-4">Log Refill</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-ink mb-2">Fill Date</label>
              <input
                type="date"
                [(ngModel)]="fillDate"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-ink mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                [(ngModel)]="quantity"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-ink mb-2">Expiry Date (optional)</label>
              <input
                type="date"
                [(ngModel)]="expiryDate"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-ink mb-2">Lot Number (optional)</label>
              <input
                type="text"
                [(ngModel)]="lotNumber"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-ink mb-2">Notes (optional)</label>
              <textarea
                [(ngModel)]="notes"
                rows="2"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="cancelled.emit()"
              class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="save()"
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Save Refill
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RefillModal {
  readonly visible = input(false);
  readonly medicationId = input<string | null>(null);
  readonly saved = output<Partial<Refill>>();
  readonly cancelled = output<void>();

  fillDate = signal(new Date().toISOString().split('T')[0]);
  quantity = signal(30);
  expiryDate = signal('');
  lotNumber = signal('');
  notes = signal('');

  save(): void {
    this.saved.emit({
      medicationId: this.medicationId() || '',
      fillDate: this.fillDate(),
      quantity: this.quantity(),
      expiryDate: this.expiryDate() || undefined,
      lotNumber: this.lotNumber() || undefined,
      notes: this.notes() || undefined,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) {
      this.cancelled.emit();
    }
  }
}
