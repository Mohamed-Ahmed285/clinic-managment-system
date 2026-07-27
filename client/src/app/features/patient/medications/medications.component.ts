import { Component, OnDestroy, OnInit } from '@angular/core';
import { TodoService, TodoResponse, TodoItem, TodoScheduleDose } from 'src/app/core/services/todo.service';

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

  totalDoses(todo: TodoResponse): number {
    return todo.items.reduce((sum, item) => sum + item.schedule.length, 0);
  }

  completedDoses(todo: TodoResponse): number {
    return todo.items.reduce(
      (sum, item) => sum + item.schedule.filter((d) => d.completed).length,
      0
    );
  }

  // Doses in the order they'll actually happen during the day, regardless of
  // the order the doctor added them in.
  sortedSchedule(item: TodoItem): TodoScheduleDose[] {
    return [...item.schedule].sort((a, b) => a.time.localeCompare(b.time));
  }

  isOverdue(dose: TodoScheduleDose): boolean {
    return !dose.completed && dose.time < this.nowTime;
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
}
