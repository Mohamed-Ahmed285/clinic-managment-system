import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './Loader.component.html',
  styleUrls: ['./Loader.component.css'],
})
export class LoaderComponent {
  @Input() message: string = 'Loading…';
}
