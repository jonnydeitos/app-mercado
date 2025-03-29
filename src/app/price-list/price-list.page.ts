import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotaFiscal } from '../services/nota-fiscal.service';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PriceListPage implements OnInit {
  notas: NotaFiscal[] = [];
  searchTerm: string = '';
  filteredNotas: NotaFiscal[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    this.notas = await this.getNotas();
    this.filteredNotas = [...this.notas];
    console.log('Notas carregadas:', this.notas);
  }

  async getNotas(): Promise<NotaFiscal[]> {
    const { value } = await Preferences.get({ key: 'notas' });
    return value ? JSON.parse(value) : [];
  }

  filterByEmpresa() {
    this.filteredNotas = this.notas.filter((nota) =>
      this.simplifyEmpresaName(nota.empresa).toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  simplifyEmpresaName(empresa: string): string {
    const parts = empresa.split(/CNPJ|,\s*/);
    return parts[0].trim();
  }

  groupByEmpresa(): { empresa: string; notas: NotaFiscal[] }[] {
    const grouped = new Map<string, NotaFiscal[]>();
    this.filteredNotas.forEach((nota) => {
      const empresa = this.simplifyEmpresaName(nota.empresa);
      if (!grouped.has(empresa)) grouped.set(empresa, []);
      grouped.get(empresa)?.push(nota);
    });
    return Array.from(grouped, ([empresa, notas]) => ({ empresa, notas }));
  }

  goToEmpresaDetails(empresa: string, notas: NotaFiscal[]) {
    this.router.navigate(['/empresa-details'], {
      state: { empresa, notas },
    });
  }

  goToHistoricoProdutos() {
    this.router.navigate(['/historico-produtos']);
  }
}