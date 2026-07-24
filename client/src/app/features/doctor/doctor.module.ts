import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorLayoutComponent } from './doctor-layout/doctor-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { NotificationsComponent } from './notifications/notifications.component';

import { FormsModule } from '@angular/forms'; // add if not already imported
import { ProfileHeaderComponent } from './update-profile/components/profile-header/profile-header.component';
import { PersonalInfoComponent } from './update-profile/components/personal-info/personal-info.component';
import { ClinicsComponent } from './update-profile/components/clinics/clinics.component';
import { ClinicCardComponent } from './update-profile/components/clinic-card/clinic-card.component';
import { ScheduleEntryComponent } from './update-profile/components/schedule-entry/schedule-entry.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { PanelSnapshotComponent } from './panel-snapshot/panel-snapshot.component';
import { RatingComponent } from './rating/rating.component';

@NgModule({
  declarations: [
  DoctorLayoutComponent,
  ProfileComponent,
  UpdateProfileComponent,
  AppointmentsComponent,
  PrescriptionsComponent,
  NotificationsComponent,
  ProfileHeaderComponent,
  PersonalInfoComponent,
  ClinicsComponent,
  ClinicCardComponent,
  ScheduleEntryComponent,
  DashboardComponent,
  ScheduleComponent,
  PanelSnapshotComponent,
  RatingComponent
],
  imports: [CommonModule, DoctorRoutingModule,FormsModule,SharedModule]
})
export class DoctorModule {}
