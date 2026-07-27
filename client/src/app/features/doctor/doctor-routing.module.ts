import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DoctorLayoutComponent } from './doctor-layout/doctor-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AppointmentComponent } from './appointment/appointment.component';
//import { PatientsComponent } from './patients/patients.component';
//import { ScheduleComponent } from './schedule/schedule.component';
const routes: Routes = [
  {
    path: '',
    component: DoctorLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'profile',
        //component: UpdateProfileComponent,
        component:  UpdateProfileComponent,
      },
      {
       path: 'dashboard',
       component: DashboardComponent,
      },

      {
        path: 'update-profile',
        component: UpdateProfileComponent,
      },

      {
     path: 'appointments',
      component: AppointmentComponent,
},

{
  path: 'appointment/:id',
  component: AppointmentComponent,
},

{
  path: 'prescriptions',
  component: PrescriptionsComponent,
},

      {
        path: 'prescriptions',
        component: PrescriptionsComponent,
      },

      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      /*{
  path: 'patients',
  component: PatientsComponent,
},
{
  path: 'schedule',
  component: ScheduleComponent,
},*/
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
