import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader/Loader.component';
import { Time12Pipe } from './pipes/time12.pipe';
import { ConfirmPopUpComponent } from './components/confirm-pop-up/confirm-pop-up.component';
import { CancelReasonModelComponent } from './components/cancel-reason-model/cancel-reason-model.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe, ConfirmPopUpComponent, CancelReasonModelComponent],
  imports: [CommonModule,RouterModule,FormsModule],
  exports: [NavbarComponent, FooterComponent,LoaderComponent, Time12Pipe,ConfirmPopUpComponent,CancelReasonModelComponent,FormsModule],
})
export class SharedModule {}
