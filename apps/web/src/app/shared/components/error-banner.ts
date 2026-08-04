import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  template: `
    <div
      class="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3"
    >
      <span class="text-danger shrink-0">⚠</span>
      <p class="flex-1 text-sm text-danger">{{ message() }}</p>
      <button
        (click)="retry.emit()"
        class="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors shrink-0"
      >
        Retry
      </button>
    </div>
  `,
})
export class ErrorBanner {
  readonly message = input('Something went wrong');
  readonly retry = output<void>();
}
