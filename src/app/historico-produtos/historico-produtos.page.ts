import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';

interface ProdutoHistorico {
  id: string;
  nome: string;
  categoria: string;
  empresa: string;
  data: string;
  valor_unitario: number;
}

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

  private categorias: { [key: string]: string[] } = {
    limpeza: ['detergente', 'sabão', 'esponja', 'desinfetante'],
    eletronicos: ['celular', 'carregador', 'fones', 'bateria'],
    carnes: ['frango', 'carne', 'linguiça', 'peixe'],
    outros: [],
  };

  constructor(private router: Router, private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadProducts();
    this.filterByCategory();
  }

  async loadProducts() {
    this.apiService.getProdutos().subscribe({
      next: (rows) => {
        this.produtosHistorico = rows.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          categoria: this.determineCategory(item.nome),
          empresa: item.empresa,
          data: item.data,
          valor_unitario: item.valor_unitario,
        }));

        this.produtosHistorico.sort((a, b) => a.nome.localeCompare(b.nome));
        this.filterByCategory();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
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
