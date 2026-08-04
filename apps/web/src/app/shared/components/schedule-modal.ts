import { Component, input, output, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Schedule } from '../../models';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" (click)="cancelled.emit()"></div>
        <div class="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold text-ink mb-4">
            {{ medicationId() ? 'Add' : 'Edit' }} Schedule
          </h3>

          <div class="space-y-4">
            <!-- Type selector -->
            <div>
              <label class="block text-sm font-medium text-ink mb-2">Schedule Type</label>
              <div class="flex gap-4">
                @for (t of types; track t) {
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      [value]="t.value"
                      [(ngModel)]="scheduleType"
                      class="text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-ink">{{ t.label }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Daily: times per day + time pickers -->
            @if (scheduleType() === 'daily') {
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Times Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  [(ngModel)]="timesPerDay"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
                />
              </div>
              @for (t of timeSlots(); track i; let i = $index) {
                <div>
                  <label class="block text-sm font-medium text-ink mb-2">Time {{ i + 1 }}</label>
                  <input
                    type="time"
                    [(ngModel)]="timeSlots()[i]"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
                  />
                </div>
              }
            }

            <!-- Weekly: day checkboxes + time pickers -->
            @if (scheduleType() === 'weekly') {
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Days of Week</label>
                <div class="flex flex-wrap gap-2">
                  @for (day of weekDays; track day.value) {
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="selectedDays().includes(day.value)"
                        (change)="toggleDay(day.value)"
                        class="text-primary focus:ring-primary rounded"
                      />
                      <span class="text-sm text-ink">{{ day.label }}</span>
                    </label>
                  }
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Time</label>
                <input
                  type="time"
                  [(ngModel)]="weeklyTime"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
                />
              </div>
            }

            <!-- PRN: max per day -->
            @if (scheduleType() === 'prn') {
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Max Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  [(ngModel)]="prnMaxPerDay"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
                />
              </div>
            }

            <!-- Dates -->
            <div>
              <label class="block text-sm font-medium text-ink mb-2">Start Date</label>
              <input
                type="date"
                [(ngModel)]="startDate"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-2">End Date (optional)</label>
              <input
                type="date"
                [(ngModel)]="endDate"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:border-border-focus focus:outline-none"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-ink mb-2">Per-Dose Notes (optional)</label>
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
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ScheduleModal {
  readonly visible = input(false);
  readonly medicationId = input<string | null>(null);
  readonly saved = output<Partial<Schedule>>();
  readonly cancelled = output<void>();

  readonly types = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'prn', label: 'PRN' },
  ];

  readonly weekDays = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
  ];

  scheduleType = signal<'daily' | 'weekly' | 'prn'>('daily');
  timesPerDay = signal(1);
  timeSlots = signal<string[]>(['08:00']);
  selectedDays = signal<number[]>([1, 2, 3, 4, 5]);
  weeklyTime = signal('08:00');
  prnMaxPerDay = signal(2);
  startDate = signal(new Date().toISOString().split('T')[0]);
  endDate = signal('');
  notes = signal('');

  toggleDay(day: number): void {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter((d) => d !== day));
    } else {
      this.selectedDays.set([...current, day]);
    }
  }

  save(): void {
    const base: Partial<Schedule> = {
      medicationId: this.medicationId() || '',
      type: this.scheduleType(),
      startDate: this.startDate(),
      endDate: this.endDate() || undefined,
      notes: this.notes() || undefined,
    };

    if (this.scheduleType() === 'daily') {
      base.times = this.timeSlots()
        .slice(0, this.timesPerDay())
        .map((t) => {
          const [h, m] = t.split(':').map(Number);
          return { hour: h, minute: m };
        });
    } else if (this.scheduleType() === 'weekly') {
      base.times = (() => {
        const [h, m] = this.weeklyTime().split(':').map(Number);
        return [{ hour: h, minute: m }];
      })();
      base.daysOfWeek = this.selectedDays();
    } else if (this.scheduleType() === 'prn') {
      base.maxPerDay = this.prnMaxPerDay();
      base.times = [];
    }

    this.saved.emit(base);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) {
      this.cancelled.emit();
    }
  }
}
