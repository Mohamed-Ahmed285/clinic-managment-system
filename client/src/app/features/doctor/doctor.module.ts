import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorLayoutComponent } from './doctor-layout/doctor-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  declarations: [
    DoctorLayoutComponent,
    ProfileComponent,
    UpdateProfileComponent,
    AppointmentsComponent,
    PrescriptionsComponent,
    NotificationsComponent,
  ],
  imports: [CommonModule, DoctorRoutingModule],
})
export class DoctorModule {}
