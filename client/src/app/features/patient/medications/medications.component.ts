import { Component, OnDestroy, OnInit } from '@angular/core';
import { TodoService, TodoResponse, TodoItem, TodoScheduleDose } from 'src/app/core/services/todo.service';

interface DoseContext {
  todo: TodoResponse;
  item: TodoItem;
  dose: TodoScheduleDose;
}

interface DayGroup {
  dateKey: string;
  date: Date;
  doses: TodoScheduleDose[];
}

type DayStatus = 'today' | 'complete' | 'missed' | 'partial' | 'upcoming';

@Component({
  selector: 'app-medications',
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.css']
})
export class MedicationsComponent implements OnInit, OnDestroy {
  todos: TodoResponse[] = [];
  loading = true;
  errorMessage = '';

  // Tracks which specific dose is mid-request, so only that one chip shows a
  // busy state instead of locking the whole page.
  pendingDoseId: string | null = null;

  // Current time as "HH:MM", used to flag doses that are overdue. Refreshed
  // every minute so the page stays accurate if left open.
  private nowTime = '';
  private clockHandle: ReturnType<typeof setInterval> | null = null;

  // Which "medication + day" chips are expanded to show individual dose
  // times, keyed by `${itemId}_${dateKey}`. Today is auto-expanded once
  // todos load.
  private expandedDays = new Set<string>();

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
    this.updateNowTime();
    this.clockHandle = setInterval(() => this.updateNowTime(), 60000);
  }

  ngOnDestroy(): void {
    if (this.clockHandle) {
      clearInterval(this.clockHandle);
      this.clockHandle = null;
    }
  }

  private updateNowTime(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.nowTime = `${hours}:${minutes}`;
  }

  loadTodos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.todoService.getMyTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        // Make sure today's doses are visible by default for every medication.
        const todayKey = new Date().toDateString();
        todos.forEach((todo) =>
          todo.items.forEach((item) => this.expandedDays.add(`${item._id}_${todayKey}`))
        );
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load your medications.';
        this.loading = false;
      }
    });
  }

  toggleDose(todo: TodoResponse, item: TodoItem, dose: TodoScheduleDose): void {
    if (this.pendingDoseId) {
      return;
    }

    this.pendingDoseId = dose._id;
    const wasCompleted = dose.completed;

    const request$ = wasCompleted
      ? this.todoService.uncompleteMedication(todo._id, item._id, dose._id)
      : this.todoService.completeMedication(todo._id, item._id, dose._id);

    request$.subscribe({
      next: (res) => {
        // Swap in the server's copy of this todo so completedAt/timestamps stay accurate
        const index = this.todos.findIndex((t) => t._id === todo._id);
        if (index !== -1) {
          this.todos[index] = res.todo;
        }
        this.pendingDoseId = null;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not update that dose. Please try again.';
        this.pendingDoseId = null;
      }
    });
  }

  // ---------- whole-course totals (per prescription) ----------

  totalDoses(todo: TodoResponse): number {
    return todo.items.reduce((sum, item) => sum + item.schedule.length, 0);
  }

  completedDoses(todo: TodoResponse): number {
    return todo.items.reduce(
      (sum, item) => sum + item.schedule.filter((d) => d.completed).length,
      0
    );
  }

  // ---------- Today, across every medication and every prescription ----------

  get todaysDoses(): DoseContext[] {
    const today = new Date();
    const result: DoseContext[] = [];

    for (const todo of this.todos) {
      for (const item of todo.items) {
        for (const dose of item.schedule) {
          if (this.isSameDay(new Date(dose.date), today)) {
            result.push({ todo, item, dose });
          }
        }
      }
    }

    return result.sort((a, b) => a.dose.time.localeCompare(b.dose.time));
  }

  get todaysCompletedCount(): number {
    return this.todaysDoses.filter((d) => d.dose.completed).length;
  }

  // ---------- per-medication day grouping (the full course) ----------

  daysForItem(item: TodoItem): DayGroup[] {
    const groups = new Map<string, DayGroup>();

    for (const dose of item.schedule) {
      const date = new Date(dose.date);
      const key = date.toDateString();
      if (!groups.has(key)) {
        groups.set(key, { dateKey: key, date, doses: [] });
      }
      groups.get(key)!.doses.push(dose);
    }

    return Array.from(groups.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((group) => ({
        ...group,
        doses: [...group.doses].sort((a, b) => a.time.localeCompare(b.time))
      }));
  }

  isDayExpanded(item: TodoItem, day: DayGroup): boolean {
    return this.expandedDays.has(`${item._id}_${day.dateKey}`);
  }

  toggleDayExpanded(item: TodoItem, day: DayGroup): void {
    const key = `${item._id}_${day.dateKey}`;
    if (this.expandedDays.has(key)) {
      this.expandedDays.delete(key);
    } else {
      this.expandedDays.add(key);
    }
  }

  dayLabel(date: Date): string {
    const today = new Date();
    if (this.isSameDay(date, today)) {
      return 'Today';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (this.isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  dayStatus(day: DayGroup): DayStatus {
    if (this.isSameDay(day.date, new Date())) {
      return 'today';
    }

    const allDone = day.doses.every((d) => d.completed);
    const someDone = day.doses.some((d) => d.completed);

    if (day.date.getTime() < this.startOfToday().getTime()) {
      return allDone ? 'complete' : someDone ? 'partial' : 'missed';
    }

    return allDone ? 'complete' : 'upcoming';
  }

  dayChipClasses(day: DayGroup): string {
    switch (this.dayStatus(day)) {
      case 'today':
        return 'border-primary text-primary bg-secondary';
      case 'complete':
        return 'bg-primary text-white border-primary';
      case 'missed':
        return 'bg-red-50 text-red-600 border-red-400';
      case 'partial':
        return 'bg-yellow-50 text-yellow-700 border-yellow-400';
      default:
        return 'border-gray text-gray-500';
    }
  }

  dayDoseSummary(day: DayGroup): string {
    const completed = day.doses.filter((d) => d.completed).length;
    return `${completed}/${day.doses.length}`;
  }

  // ---------- shared dose chip styling ----------

  isOverdue(dose: TodoScheduleDose): boolean {
    if (dose.completed) {
      return false;
    }
    const doseDate = new Date(dose.date);
    if (this.isSameDay(doseDate, new Date())) {
      return dose.time < this.nowTime;
    }
    return doseDate.getTime() < this.startOfToday().getTime();
  }

  doseChipClasses(dose: TodoScheduleDose): string {
    if (dose.completed) {
      return 'bg-primary text-white border-primary';
    }
    if (this.isOverdue(dose)) {
      return 'bg-red-50 text-red-600 border-red-400';
    }
    return 'border-gray text-gray-700';
  }

  doseIcon(dose: TodoScheduleDose): string {
    if (dose.completed) {
      return 'fa-check';
    }
    if (this.isOverdue(dose)) {
      return 'fa-triangle-exclamation';
    }
    return 'fa-clock';
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
