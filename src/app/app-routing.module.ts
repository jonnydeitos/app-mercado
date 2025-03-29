import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'scan', pathMatch: 'full' },
  {
    path: 'scan',
    loadChildren: () =>
      import('./scan/scan.module').then((m) => m.ScanPageModule),
  },
  {
    path: 'price-list',
    loadChildren: () =>
      import('./price-list/price-list.module').then(
        (m) => m.PriceListPageModule
      ),
  },
  {
    path: 'empresa-details',
    loadChildren: () => import('./empresa-details/empresa-details.module').then( m => m.EmpresaDetailsPageModule)
  },
  {
    path: 'historico-produtos',
    loadChildren: () => import('./historico-produtos/historico-produtos.module').then( m => m.HistoricoProdutosPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
