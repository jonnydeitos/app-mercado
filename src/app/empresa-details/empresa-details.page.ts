import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NotaFiscal } from '../services/nota-fiscal.service';

interface ItemComparativo {
  nome: string;
  lancamentos: { data: string; valorUnitario: number; diferenca?: { valor: number; percentual: number } }[];
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
  notas: NotaFiscal[] = [];
  itensComparativos: ItemComparativo[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.empresa = navigation.extras.state['empresa'];
      this.notas = navigation.extras.state['notas'];
      this.notas = this.removeDuplicates(this.notas);
      this.prepareComparativo();
    }
  }

  removeDuplicates(notas: NotaFiscal[]): NotaFiscal[] {
    const seen = new Set<string>();
    return notas.filter((nota) => {
      if (!nota.numeroNFe) return true;
      if (seen.has(nota.numeroNFe)) return false;
      seen.add(nota.numeroNFe);
      return true;
    });
  }

  simplifyEmpresaName(empresa: string): string {
    const parts = empresa.split(/CNPJ|,\s*/);
    return parts[0].trim();
  }

  prepareComparativo() {
    // Agrupar todos os itens por nome
    const itensMap = new Map<string, { data: string; valorUnitario: number }[]>();
    this.notas.forEach((nota) => {
      nota.itens.forEach((item) => {
        if (!itensMap.has(item.nome)) {
          itensMap.set(item.nome, []);
        }
        itensMap.get(item.nome)?.push({
          data: nota.data,
          valorUnitario: item.valorUnitario,
        });
      });
    });

    // Converter o mapa em uma lista de itens comparativos
    this.itensComparativos = Array.from(itensMap, ([nome, lancamentos]) => {
      // Ordenar os lançamentos por data (do mais antigo ao mais recente)
      lancamentos.sort((a, b) => {
        const [dayA, monthA, yearA] = a.data.split('/').map(Number);
        const [dayB, monthB, yearB] = b.data.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      });

      // Calcular as diferenças
      const lancamentosComDiferenca = lancamentos.map((lancamento, index) => {
        if (index === 0) {
          // Primeiro lançamento, sem comparação
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

    // Ordenar os itens por nome
    this.itensComparativos.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}