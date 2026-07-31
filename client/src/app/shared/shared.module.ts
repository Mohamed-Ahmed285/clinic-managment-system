import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader/Loader.component';
import { Time12Pipe } from './pipes/time12.pipe';
import { ConfirmPopUpComponent } from './components/confirm-pop-up/confirm-pop-up.component';

@NgModule({
  declarations: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe, ConfirmPopUpComponent],
  imports: [CommonModule,RouterModule],
  exports: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe,ConfirmPopUpComponent],
})
export class SharedModule {}
