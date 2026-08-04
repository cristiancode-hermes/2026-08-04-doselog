import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <span class="text-5xl mb-4">{{ icon() }}</span>
      <h3 class="text-xl font-semibold text-ink mb-2">{{ title() }}</h3>
      <p class="text-ink-muted max-w-md mb-6">{{ message() }}</p>
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyState {
  readonly icon = input('📋');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input('');
  readonly action = output<void>();
}
