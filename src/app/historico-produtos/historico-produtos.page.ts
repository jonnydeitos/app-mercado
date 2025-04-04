import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, ProdutoHistorico } from '../services/api.service';

@Component({
  selector: 'app-historico-produtos',
  templateUrl: './historico-produtos.page.html',
  styleUrls: ['./historico-produtos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule],
})
export class HistoricoProdutosPage implements OnInit {
  produtosHistorico: ProdutoHistorico[] = [];
  produtosFiltrados: ProdutoHistorico[] = [];
  selectedCategory: string = 'todos';
  isLoading: boolean = false;

  private categorias: { [key: string]: string[] } = {
    limpeza: ['detergente', 'sabão', 'esponja', 'desinfetante'],
    eletronicos: ['celular', 'carregador', 'fones', 'bateria'],
    carnes: ['frango', 'carne', 'linguiça', 'peixe'],
    outros: [],
  };

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadProducts();
    this.filterByCategory();
  }

  async loadProducts() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Carregando produtos...',
      spinner: 'crescent',
    });
    await loading.present();
    this.apiService.getProdutos().subscribe({
      next: (rows: ProdutoHistorico[]) => {
        this.produtosHistorico = rows.map((item) => ({
          id: item.id,
          nome: item.nome,
          categoria: this.determineCategory(item.nome),
          empresa: item.empresa,
          data: item.data,
          valor_unitario: item.valor_unitario,
        }));

        this.produtosHistorico.sort((a, b) => a.nome.localeCompare(b.nome));
        this.filterByCategory();
        this.isLoading = false;
        loading.dismiss();
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos:', err);
        this.isLoading = false;
        loading.dismiss();
      },
    });
  }

  determineCategory(nome: string): string {
    const nomeLower = nome.toLowerCase();
    for (const [categoria, palavras] of Object.entries(this.categorias)) {
      if (palavras.some((palavra) => nomeLower.includes(palavra))) {
        return categoria;
      }
    }
    return 'outros';
  }

  filterByCategory() {
    if (this.selectedCategory === 'todos') {
      this.produtosFiltrados = [...this.produtosHistorico];
    } else {
      this.produtosFiltrados = this.produtosHistorico.filter(
        (produto) => produto.categoria === this.selectedCategory
      );
    }
  }

  getLastPrice(produto: ProdutoHistorico): number {
    return produto.valor_unitario;
  }

  showProductDetails(produto: ProdutoHistorico) {
    this.router.navigate(['/produto-detalhes'], {
      state: { produto },
    });
  }
}
