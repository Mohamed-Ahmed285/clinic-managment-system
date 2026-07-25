import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { ClinicsComponent } from './clinics/clinics.component';
import { UsersComponent } from './users/users.component';
import { SpecialtiesComponent } from './specialties/specialties.component';
import { AnalyticsComponent } from './analytics/analytics.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    ProfileComponent,
    UpdateProfileComponent,
    AppointmentsComponent,
    ClinicsComponent,
    UsersComponent,
    SpecialtiesComponent,
    AnalyticsComponent,
  ],
  imports: [CommonModule, AdminRoutingModule, FormsModule],
})
export class AdminModule {}
