import { Component, Input } from '@angular/core';
import { PanelStat } from '../models/dashboard.model';
import { DoctorService } from 'src/app/core/services/doctor.service';

@Component({
  selector: 'app-panel-snapshot',
  templateUrl: './panel-snapshot.component.html',
  styleUrls: ['./panel-snapshot.component.css']
})
export class PanelSnapshotComponent {

  @Input() stats: PanelStat[] = [];

  showModal = false;
  modalTitle = '';
  patients: any[] = [];
  appointments: any[] = [];

  constructor(private doctorService: DoctorService) {}

  openModal(title: string) {

    this.modalTitle = title;

    if (title === 'Active patients') {

      this.doctorService.getActivePatients().subscribe({

        next: (res) => {

          this.patients = res;
          this.showModal = true;

        },

        error: (err) => {
          console.error(err);
        }

      });

    }
    if (title === 'Total appointments') {

  this.doctorService.getAppointments().subscribe({

    next: (res) => {

      this.appointments = res;
      this.showModal = true;

    },

    error: (err) => console.error(err)

  });

}

  }

  closeModal() {
    this.showModal = false;
  }

}