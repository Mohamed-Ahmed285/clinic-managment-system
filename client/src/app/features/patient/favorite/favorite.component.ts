import { Component, OnInit } from '@angular/core';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css'],
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = [];
  isLoading = true;
  removingIds = new Set<string>();

  constructor(
    private favoriteService: FavoriteService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;

    this.favoriteService.getMyFavorites().subscribe({
      next: (res: any) => {
        console.log(res);

        this.favorites = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);

        this.isLoading = false;
      },
    });
  }
  getDoctorId(doctor: any): string {
    return doctor?._id?._id || doctor?._id;
  }
  getInitials(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
  getStars(average: number): string[] {
    const rating = average || 0;

    return [1, 2, 3, 4, 5].map((star) => {
      if (rating >= star) return 'fa-solid fa-star';

      if (rating >= star - 0.5) return 'fa-solid fa-star-half-stroke';

      return 'fa-regular fa-star';
    });
  }
  isRemoving(doctor: any): boolean {
    return this.removingIds.has(this.getDoctorId(doctor));
  }
  removeFavorite(doctor: any) {
    const doctorId = this.getDoctorId(doctor);

    if (!doctorId || this.removingIds.has(doctorId)) return;

    this.removingIds.add(doctorId);

    this.favoriteService.removeFavorite(doctorId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(
          (favorite: any) => this.getDoctorId(favorite) !== doctorId,
        );
this.toastr.success('You removed this doctor from your favourite', 'Success');
        this.removingIds.delete(doctorId);
      },
      error: (err) => {
        console.log(err);

        this.removingIds.delete(doctorId);

        alert(err.error);
      },
    });
  }
}
