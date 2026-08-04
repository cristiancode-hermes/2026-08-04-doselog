import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      [class.bg-success/15]="status() === 'taken'"
      [class.text-success]="status() === 'taken'"
      [class.bg-warning/15]="status() === 'late'"
      [class.text-warning]="status() === 'late'"
      [class.bg-danger/15]="status() === 'missed'"
      [class.text-danger]="status() === 'missed'"
      [class.bg-ink-subtle/15]="status() === 'skipped'"
      [class.text-ink-subtle]="status() === 'skipped'"
      [class.bg-info/15]="status() === 'upcoming'"
      [class.text-info]="status() === 'upcoming'"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();

  label(): string {
    switch (this.status()) {
      case 'taken':
        return '✓ Taken';
      case 'late':
        return '⚠ Late';
      case 'missed':
        return '✗ Missed';
      case 'skipped':
        return '– Skipped';
      case 'upcoming':
        return '○ Upcoming';
      default:
        return this.status();
    }
  }
}
