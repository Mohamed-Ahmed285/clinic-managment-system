import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'update-profile',
        component: UpdateProfileComponent,
      },
      {
        path: 'appointments',
        component: AppointmentsComponent,
      },
      {
        path: 'prescriptions',
        component: PrescriptionsComponent,
      },
      {
        path: 'reviews',
        component: ReviewsComponent,
      },
      {
        path: 'favorite',
        component: FavoriteComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
