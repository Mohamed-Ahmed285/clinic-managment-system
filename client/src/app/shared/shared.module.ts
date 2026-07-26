import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader/Loader.component';

@NgModule({
  declarations: [NavbarComponent, FooterComponent,LoaderComponent],
  imports: [CommonModule,RouterModule],
  exports: [NavbarComponent, FooterComponent,LoaderComponent],
})
export class SharedModule {}
