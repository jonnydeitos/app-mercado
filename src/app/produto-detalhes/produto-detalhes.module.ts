import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProdutoDetalhesPageRoutingModule } from './produto-detalhes-routing.module';

import { ProdutoDetalhesPage } from './produto-detalhes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProdutoDetalhesPageRoutingModule,
    ProdutoDetalhesPage,
  ],
})
export class ProdutoDetalhesPageModule {}
