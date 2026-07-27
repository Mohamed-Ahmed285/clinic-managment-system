import { Component, OnInit } from '@angular/core';
import { TodoService, TodoResponse, TodoItem, TodoScheduleDose } from 'src/app/core/services/todo.service';

@Component({
  selector: 'app-medications',
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.css']
})
export class MedicationsComponent implements OnInit {
  todos: TodoResponse[] = [];
  loading = true;
  errorMessage = '';

  // Tracks which specific dose is mid-request, so only that one chip shows a
  // busy state instead of locking the whole page.
  pendingDoseId: string | null = null;

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
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
}
