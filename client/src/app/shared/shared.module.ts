import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader/loader.component';
import { Time12Pipe } from './pipes/time12.pipe';

@NgModule({
  declarations: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe],
  imports: [CommonModule,RouterModule],
  exports: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe],
})
export class SharedModule {}
