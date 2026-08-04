import { Component, input, output, HostListener } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" (click)="cancel.emit()"></div>
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-ink mb-2">{{ title() }}</h3>
          <p class="text-ink-muted mb-6">{{ message() }}</p>
          <div class="flex justify-end gap-3">
            <button
              (click)="cancel.emit()"
              class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="confirm.emit()"
              class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              [class.bg-danger]="danger()"
              [class.bg-danger-hover]="danger()"
              [class.bg-primary]="!danger()"
              [class.hover:bg-primary-hover]="!danger()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  readonly visible = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly confirmLabel = input('Confirm');
  readonly danger = input(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) {
      this.cancel.emit();
    }
  }
}
