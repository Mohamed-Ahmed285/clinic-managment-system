import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Notification {
  _id: string;
  recipientId: string;
  recipientType: 'doctor' | 'patient';
  title: string;
  message: string;
  type: string;
  relatedAppointmentId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<Notification[]> {
  return this.http.get<Notification[]>(
    `${this.api}/notifications`
  );
}

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(
      `${this.api}/notifications/${id}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${this.api}/notifications/read-all`,
      {}
    );
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(
      `${this.api}/notifications/${id}`
    );
  }

 getAppointmentDetails(id: string): Observable<any> {
  return this.http.get<any>(
    `${this.api}/notifications/${id}/details`
  );
}


}