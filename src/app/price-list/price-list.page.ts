import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { ApiService, ProdutoHistorico } from '../services/api.service';
import { Preferences } from '@capacitor/preferences';

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
              // Excluir produtos do banco de dados
              const data = produtos[0].data; // Assume que todos os produtos da nota têm a mesma data
              await this.apiService.deletarProdutos(empresa, data).toPromise();

              // Remover a nota do armazenamento local
              const existingNotas = await this.getNotas();
              const updatedNotas = existingNotas.filter(
                (nota) =>
                  nota.empresa !== empresa ||
                  this.formatarData(nota.data) !== data
              );
              await Preferences.set({
                key: 'notas',
                value: JSON.stringify(updatedNotas),
              });

              // Atualizar a lista de produtos
              this.produtos = this.produtos.filter(
                (produto) =>
                  produto.empresa !== empresa || produto.data !== data
              );
              this.filteredProdutos = [...this.produtos];

              await loading.dismiss();
              await this.showAlert('Sucesso', 'Nota excluída com sucesso.');
            } catch (err) {
              console.error('Erro ao excluir nota:', err);
              await loading.dismiss();
              await this.showAlert('Erro', 'Falha ao excluir a nota.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private formatarData(data: string): string {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async getNotas(): Promise<any[]> {
    const { value } = await Preferences.get({ key: 'notas' });
    return value ? JSON.parse(value) : [];
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
