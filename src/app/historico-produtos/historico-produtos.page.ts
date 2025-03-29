import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NotaFiscal } from '../services/nota-fiscal.service';

interface ProdutoHistorico {
  nome: string;
  lancamentos: { empresa: string; data: string; valorUnitario: number; diferenca?: { valor: number; percentual: number } }[];
}

@Component({
  selector: 'app-historico-produtos',
  templateUrl: './historico-produtos.page.html',
  styleUrls: ['./historico-produtos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistoricoProdutosPage implements OnInit {
  produtosHistorico: ProdutoHistorico[] = [];

  constructor() {}

  async ngOnInit() {
    const notas = await this.getNotas();
    this.prepareHistorico(notas);
  }

  async getNotas(): Promise<NotaFiscal[]> {
    const { value } = await Preferences.get({ key: 'notas' });
    return value ? JSON.parse(value) : [];
  }

  prepareHistorico(notas: NotaFiscal[]) {
    // Agrupar todos os itens por nome
    const produtosMap = new Map<string, { empresa: string; data: string; valorUnitario: number }[]>();
    notas.forEach((nota) => {
      const empresa = this.simplifyEmpresaName(nota.empresa);
      nota.itens.forEach((item) => {
        if (!produtosMap.has(item.nome)) {
          produtosMap.set(item.nome, []);
        }
        produtosMap.get(item.nome)?.push({
          empresa,
          data: nota.data,
          valorUnitario: item.valorUnitario,
        });
      });
    });

    // Converter o mapa em uma lista de produtos históricos
    this.produtosHistorico = Array.from(produtosMap, ([nome, lancamentos]) => {
      // Ordenar os lançamentos por data (do mais antigo ao mais recente)
      lancamentos.sort((a, b) => {
        const [dayA, monthA, yearA] = a.data.split('/').map(Number);
        const [dayB, monthB, yearB] = b.data.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      });

      // Calcular as diferenças
      const lancamentosComDiferenca = lancamentos.map((lancamento, index) => {
        if (index === 0) {
          return { ...lancamento, diferenca: undefined };
        }

        const anterior = lancamentos[index - 1];
        const valorDiferenca = lancamento.valorUnitario - anterior.valorUnitario;
        const percentualDiferenca = (valorDiferenca / anterior.valorUnitario) * 100;

        return {
          ...lancamento,
          diferenca: {
            valor: valorDiferenca,
            percentual: percentualDiferenca,
          },
        };
      });

      return { nome, lancamentos: lancamentosComDiferenca };
    });

    // Ordenar os produtos por nome
    this.produtosHistorico.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  simplifyEmpresaName(empresa: string): string {
    const parts = empresa.split(/CNPJ|,\s*/);
    return parts[0].trim();
  }
}