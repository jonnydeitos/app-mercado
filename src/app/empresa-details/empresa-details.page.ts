import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProdutoHistorico } from '../services/api.service';

interface ItemComparativo {
  nome: string;
  lancamentos: {
    data: string;
    valorUnitario: number;
    diferenca?: { valor: number; percentual: number };
  }[];
}

@Component({
  selector: 'app-empresa-details',
  templateUrl: './empresa-details.page.html',
  styleUrls: ['./empresa-details.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class EmpresaDetailsPage implements OnInit {
  empresa: string = '';
  produtos: ProdutoHistorico[] = [];
  itensComparativos: ItemComparativo[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.empresa = navigation.extras.state['empresa'];
      this.produtos = navigation.extras.state['produtos'];
      this.prepareItensComparativos();
    }
  }

  prepareItensComparativos() {
    // Agrupar produtos por nome
    const groupedByNome = new Map<string, ProdutoHistorico[]>();
    this.produtos.forEach((produto) => {
      if (!groupedByNome.has(produto.nome)) groupedByNome.set(produto.nome, []);
      groupedByNome.get(produto.nome)?.push(produto);
    });

    // Calcular diferenças de preço
    this.itensComparativos = Array.from(groupedByNome, ([nome, produtos]) => {
      // Ordenar por data (mais recente primeiro)
      produtos.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );

      const lancamentos = produtos.map((produto, index) => {
        const lancamento = {
          data: produto.data,
          valorUnitario: produto.valor_unitario,
        };

        // Calcular diferença em relação ao lançamento anterior (se existir)
        if (index < produtos.length - 1) {
          const anterior = produtos[index + 1].valor_unitario;
          const diferencaValor = produto.valor_unitario - anterior;
          const diferencaPercentual =
            anterior !== 0 ? (diferencaValor / anterior) * 100 : 0;
          return {
            ...lancamento,
            diferenca: {
              valor: diferencaValor,
              percentual: diferencaPercentual,
            },
          };
        }
        return lancamento;
      });

      return { nome, lancamentos };
    });
  }

  goToProdutoDetalhes(produto: ProdutoHistorico) {
    this.router.navigate(['/produto-detalhes'], {
      state: { produto },
    });
  }
}
