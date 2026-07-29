import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  constructor(private http: HttpClient) {}

  getMyFavorites() {
    return this.http.get(`${environment.apiUrl}/patient/favorites`);
  }
  addFavorite(doctorId: string) {
    return this.http.post(
      `${environment.apiUrl}/patient/favorites/${doctorId}`,
      {},
    );
  }
  removeFavorite(doctorId: string) {
    return this.http.delete(
      `${environment.apiUrl}/patient/favorites/${doctorId}`,
    );
  }
}
