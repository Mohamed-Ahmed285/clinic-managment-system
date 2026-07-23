import { Component, Input } from '@angular/core';
import { PanelStat } from '../models/dashboard.model';

@Component({
  selector: 'app-panel-snapshot',
  templateUrl: './panel-snapshot.component.html',
  styleUrls: ['./panel-snapshot.component.css']
})
export class PanelSnapshotComponent {
  @Input() stats: PanelStat[] = [];
}
