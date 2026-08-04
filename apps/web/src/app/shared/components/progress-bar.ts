import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="w-full">
      @if (label()) {
        <div class="mb-1 flex items-center justify-between text-xs">
          <span class="text-ink-muted">{{ label() }}</span>
          <span class="font-medium text-ink">{{ percent() }}%</span>
        </div>
      }
      <div class="h-2 w-full overflow-hidden rounded-full bg-bg">
        <div
          class="h-full rounded-full transition-all duration-500"
          [style.width.%]="percent()"
          [class.bg-success]="color() === 'success'"
          [class.bg-warning]="color() === 'warning'"
          [class.bg-danger]="color() === 'danger'"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressBar {
  readonly percent = input.required<number>();
  readonly color = input<'success' | 'warning' | 'danger'>('success');
  readonly label = input('');
}
