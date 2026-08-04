import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    @for (_ of [].constructor(count()); track $index) {
      @if (type() === 'card') {
        <div class="animate-pulse rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 h-4 w-3/4 rounded bg-bg"></div>
          <div class="mb-2 h-3 w-1/2 rounded bg-bg"></div>
          <div class="h-3 w-1/3 rounded bg-bg"></div>
        </div>
      }
      @if (type() === 'list') {
        <div class="animate-pulse flex items-center gap-4 border-b border-divider py-4">
          <div class="h-10 w-10 rounded-full bg-bg"></div>
          <div class="flex-1">
            <div class="mb-2 h-4 w-2/3 rounded bg-bg"></div>
            <div class="h-3 w-1/3 rounded bg-bg"></div>
          </div>
        </div>
      }
      @if (type() === 'calendar') {
        <div class="animate-pulse grid grid-cols-7 gap-1">
          @for (_ of [].constructor(35); track $index) {
            <div class="aspect-square rounded bg-bg"></div>
          }
        </div>
      }
    }
  `,
})
export class LoadingSkeleton {
  readonly type = input<'card' | 'list' | 'calendar'>('card');
  readonly count = input(3);
}
