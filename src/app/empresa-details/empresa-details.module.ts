import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaDetailsPageRoutingModule } from './empresa-details-routing.module';

import { EmpresaDetailsPage } from './empresa-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaDetailsPageRoutingModule,
    EmpresaDetailsPage
  ],
})
export class EmpresaDetailsPageModule {}
