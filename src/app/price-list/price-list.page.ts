import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { ApiService, ProdutoHistorico } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

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

    try {
      this.apiService.getProdutos().subscribe({
        next: (produtos) => {
          console.log('Dados brutos recebidos do back-end:', produtos);
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
    } catch (err) {
      console.error('Erro inesperado ao carregar produtos:', err);
      this.isLoading = false;
      await loading.dismiss();
      await this.showAlert('Erro', 'Erro inesperado ao carregar os produtos.');
    }
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
              // Filtrar produtos com datas válidas
              const produtosValidos = produtos.filter(
                (produto) => produto.data && typeof produto.data === 'string'
              );

              if (produtosValidos.length === 0) {
                throw new Error('Nenhum produto com data válida encontrado para exclusão');
              }

              // Obter todas as datas únicas dos produtos válidos
              const datasUnicas = [...new Set(produtosValidos.map((produto) => produto.data))];
              console.log(`Datas únicas para ${empresa}:`, datasUnicas);

              if (datasUnicas.length === 0) {
                throw new Error('Nenhuma data válida encontrada para exclusão');
              }

              // Fazer uma requisição DELETE para cada data
              for (const data of datasUnicas) {
                await this.apiService.deletarProdutos(empresa, data).toPromise();
              }

              // Recarregar os dados do back-end
              await this.loadProdutos();

              await loading.dismiss();
              await this.showAlert('Sucesso', 'Produtos excluídos com sucesso.');
            } catch (err) {
              await loading.dismiss(); // Garantir que o loading seja sempre encerrado
              if (err instanceof HttpErrorResponse) {
                console.error('Erro HTTP:', err);
                await this.showAlert('Erro', `Falha ao excluir os produtos: ${err.error?.message || err.message}`);
              } else if (err instanceof Error) {
                console.error('Erro genérico:', err.message);
                await this.showAlert('Erro', `Falha ao excluir os produtos: ${err.message}`);
              } else {
                console.error('Erro desconhecido:', err);
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