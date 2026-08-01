import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TodoScheduleDose {
  _id: string;
  date: string;
  time: string;
  completed: boolean;
  completedAt: string | null;
  reminderSent: boolean;
}

export interface TodoItem {
  _id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
  startDate?: string;
  durationDays?: number;
  schedule: TodoScheduleDose[];
}

export interface TodoResponse {
  _id: string;
  patientId: string;
  appointmentId?: any;
  prescriptionId?: any;
  items: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get every medication checklist for the logged-in patient
  getMyTodos(): Observable<TodoResponse[]> {
    return this.http.get<TodoResponse[]>(`${this.api}/todo`);
  }

  // Mark a scheduled dose as taken
  completeMedication(
    todoId: string,
    itemId: string,
    scheduleId: string
  ): Observable<{ message: string; todo: TodoResponse }> {
    return this.http.patch<{ message: string; todo: TodoResponse }>(
      `${this.api}/todo/${todoId}/items/${itemId}/schedule/${scheduleId}`,
      {}
    );
  }

  // Undo marking a scheduled dose as taken
  uncompleteMedication(
    todoId: string,
    itemId: string,
    scheduleId: string
  ): Observable<{ message: string; todo: TodoResponse }> {
    return this.http.patch<{ message: string; todo: TodoResponse }>(
      `${this.api}/todo/${todoId}/items/${itemId}/schedule/${scheduleId}/reset`,
      {}
    );
  }
}
