import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ApiService, ProdutoHistorico } from '../services/api.service';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PriceListPage implements OnInit {
  produtos: ProdutoHistorico[] = [];
  searchTerm: string = '';
  filteredProdutos: ProdutoHistorico[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadProdutos();
  }

  async loadProdutos() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Carregando empresas...',
      spinner: 'crescent',
    });
    await loading.present();

    this.apiService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.filteredProdutos = [...this.produtos];
        console.log('Produtos carregados:', this.produtos);
        this.isLoading = false;
        loading.dismiss();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.isLoading = false;
        loading.dismiss();
      },
    });
  }

  filterByEmpresa() {
    this.filteredProdutos = this.produtos.filter((produto) =>
      this.simplifyEmpresaName(produto.empresa)
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

  simplifyEmpresaName(empresa: string): string {
    const parts = empresa.split(/CNPJ|,\s*/);
    return parts[0].trim();
  }

  groupByEmpresa(): { empresa: string; produtos: ProdutoHistorico[] }[] {
    const grouped = new Map<string, ProdutoHistorico[]>();
    this.filteredProdutos.forEach((produto) => {
      const empresa = this.simplifyEmpresaName(produto.empresa);
      if (!grouped.has(empresa)) grouped.set(empresa, []);
      grouped.get(empresa)?.push(produto);
    });
    return Array.from(grouped, ([empresa, produtos]) => ({
      empresa,
      produtos,
    }));
  }

  goToEmpresaDetails(empresa: string, produtos: ProdutoHistorico[]) {
    this.router.navigate(['/empresa-details'], {
      state: { empresa, produtos },
    });
  }

  goToHistoricoProdutos() {
    this.router.navigate(['/historico-produtos']);
  }
}
