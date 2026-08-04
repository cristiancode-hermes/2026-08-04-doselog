import { Component, signal, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { DosesService } from '../../services/doses.service';
import { AdherenceDay, DoseWithMedication } from '../../models';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton';
import { ErrorBanner } from '../../shared/components/error-banner';
import { EmptyState } from '../../shared/components/empty-state';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [DatePipe, LoadingSkeleton, ErrorBanner, EmptyState],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-ink">History</h1>
        <div class="flex items-center gap-2">
          <button
            (click)="prevMonth()"
            class="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-bg transition-colors"
          >
            ←
          </button>
          <span class="text-sm font-medium text-ink min-w-[140px] text-center">
            {{ currentYear() }} · {{ monthName() }}
          </span>
          <button
            (click)="nextMonth()"
            class="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-bg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      @if (error()) {
        <app-error-banner [message]="error()" (retry)="loadMonth()" class="mb-4 block" />
      }

      @if (loading()) {
        <app-loading-skeleton type="calendar" />
      }

      @if (!loading() && !error()) {
        <!-- Weekday headers -->
        <div class="grid grid-cols-7 mb-2">
          @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
            <div class="text-center text-xs font-medium text-ink-muted py-2">{{ day }}</div>
          }
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          @for (day of calendarDays(); track day.date) {
            <button
              (click)="selectDay(day.date)"
              class="aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-1"
              [class.border-border]="!day.isCurrentMonth"
              [class.border-border-focus]="day.isCurrentMonth && !day.selected"
              [class.border-primary]="day.selected"
              [class.bg-primary/5]="day.selected"
              [class.opacity-40]="!day.isCurrentMonth"
            >
              <span class="text-sm font-medium text-ink">{{ day.dayNum }}</span>
              <div class="flex gap-0.5">
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  [class.bg-success]="day.adherence === 100"
                  [class.bg-warning]="day.adherence >= 80 && day.adherence < 100"
                  [class.bg-orange-400]="day.adherence >= 50 && day.adherence < 80"
                  [class.bg-danger]="day.adherence > 0 && day.adherence < 50"
                  [class.bg-ink-subtle/30]="day.adherence === 0"
                ></span>
              </div>
            </button>
          }
        </div>

        <!-- Selected day detail -->
        @if (selectedDayDoses(); as doses) {
          @if (doses.length > 0) {
            <div class="mt-6 rounded-xl border border-border bg-surface p-4">
              <h3 class="text-sm font-semibold text-ink mb-3">
                {{ selectedDate() | date: 'fullDate' }}
              </h3>
              <div class="space-y-2">
                @for (dose of doses; track dose.id) {
                  <div class="flex items-center justify-between py-2 border-b border-divider last:border-0">
                    <div>
                      <span class="text-sm font-medium text-ink">{{ dose.medication?.name || 'Unknown' }}</span>
                      <span class="text-xs text-ink-muted ml-2">
                        {{ dose.scheduledTime ? (dose.scheduledTime | date: 'h:mm a') : '' }}
                      </span>
                    </div>
                    <span
                      class="text-xs font-medium px-2 py-0.5 rounded-full"
                      [class.bg-success/15]="dose.status === 'taken'"
                      [class.text-success]="dose.status === 'taken'"
                      [class.bg-danger/15]="dose.status === 'missed'"
                      [class.text-danger]="dose.status === 'missed'"
                      [class.bg-warning/15]="dose.status === 'late'"
                      [class.text-warning]="dose.status === 'late'"
                      [class.bg-ink-subtle/15]="dose.status === 'skipped'"
                      [class.text-ink-subtle]="dose.status === 'skipped'"
                    >
                      {{ dose.status }}
                    </span>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="mt-6">
              <app-empty-state
                icon="📅"
                title="No doses"
                message="No doses recorded for this day."
              />
            </div>
          }
        }
      }
    </div>
  `,
})
export class CalendarPage implements OnInit {
  private statsService = inject(StatsService);
  private dosesService = inject(DosesService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly adherenceData = signal<AdherenceDay[]>([]);
  readonly currentYear = signal(new Date().getFullYear());
  readonly currentMonth = signal(new Date().getMonth() + 1);
  readonly selectedDate = signal(new Date().toISOString().split('T')[0]);
  readonly selectedDayDoses = signal<DoseWithMedication[] | null>(null);

  readonly monthName = () => {
    const date = new Date(this.currentYear(), this.currentMonth() - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  readonly calendarDays = () => this.computeCalendar();

  ngOnInit(): void {
    this.loadMonth();
  }

  prevMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentYear.set(this.currentYear() - 1);
      this.currentMonth.set(12);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentYear.set(this.currentYear() + 1);
      this.currentMonth.set(1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.loadMonth();
  }

  loadMonth(): void {
    this.loading.set(true);
    this.error.set('');

    this.statsService.getMonth(this.currentYear(), this.currentMonth()).subscribe({
      next: (data) => {
        this.adherenceData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load calendar data');
        this.loading.set(false);
      },
    });
  }

  selectDay(date: string): void {
    this.selectedDate.set(date);
    this.dosesService.getByDate(date).subscribe({
      next: (doses) => this.selectedDayDoses.set(doses),
      error: () => this.selectedDayDoses.set([]),
    });
  }

  private computeCalendar(): {
    date: string;
    dayNum: number;
    isCurrentMonth: boolean;
    adherence: number;
    selected: boolean;
  }[] {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPad = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonthLast = new Date(year, month - 1, 0).getDate();

    const result: any[] = [];
    const adhMap = new Map<string, number>();
    for (const d of this.adherenceData()) {
      adhMap.set(d.date, d.adherence);
    }

    // Previous month padding
    for (let i = startPad - 1; i >= 0; i--) {
      const day = prevMonthLast - i;
      const date = `${year}-${String(month - 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      result.push({
        date,
        dayNum: day,
        isCurrentMonth: false,
        adherence: adhMap.get(date) || 0,
        selected: date === this.selectedDate(),
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      result.push({
        date,
        dayNum: day,
        isCurrentMonth: true,
        adherence: adhMap.get(date) || 0,
        selected: date === this.selectedDate(),
      });
    }

    // Next month padding
    const remaining = 42 - result.length;
    for (let day = 1; day <= remaining; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      result.push({
        date,
        dayNum: day,
        isCurrentMonth: false,
        adherence: 0,
        selected: false,
      });
    }

    return result;
  }
}
