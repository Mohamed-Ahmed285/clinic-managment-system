import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientRoutingModule } from './patient-routing.module';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    PatientLayoutComponent,
    ProfileComponent,
    UpdateProfileComponent,
    AppointmentsComponent,
    PrescriptionsComponent,
    ReviewsComponent,
    FavoriteComponent,
    NotificationsComponent,
  ],
  imports: [CommonModule, PatientRoutingModule, SharedModule,FormsModule],
})
export class PatientModule {}
