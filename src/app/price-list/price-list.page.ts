import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
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
    private loadingController: LoadingController,
    private alertController: AlertController
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
        this.showAlert('Erro', 'Não foi possível carregar os produtos.');
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

  async excluirNota(empresa: string, produtos: ProdutoHistorico[]) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja excluir todos os produtos da empresa ${empresa}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo produtos...',
              spinner: 'crescent',
            });
            await loading.present();

            try {
              const datasUnicas = [...new Set(produtos.map((produto) => produto.data))];
              for (const data of datasUnicas) {
                await this.apiService.deletarProdutos(empresa, data).toPromise();
              }
              await this.loadProdutos();
            } catch (err: unknown) {
              // Verificar se o erro é uma instância de Error
              if (err instanceof Error) {
                console.error('Erro ao excluir produtos:', err);
                await this.showAlert('Erro', `Falha ao excluir os produtos: ${err.message}`);
              } else {
                // Caso o erro não seja uma instância de Error, tratar como desconhecido
                console.error('Erro desconhecido ao excluir produtos:', err);
                await this.showAlert('Erro', 'Falha ao excluir os produtos: Erro desconhecido');
              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
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