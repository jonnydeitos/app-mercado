import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences'; // Substitui Storage por Preferences
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
    const { value } = await Preferences.get({ key: 'notas' }); // Ajustado para Preferences
    return value ? JSON.parse(value) : [];
  }

  filterByEmpresa() {
    this.filteredNotas = this.notas.filter((nota) =>
      nota.empresa.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  groupByMonth(): { month: string; notas: NotaFiscal[] }[] {
    const grouped = new Map<string, NotaFiscal[]>();
    this.notas.forEach((nota) => {
      const [day, month, year] = nota.data.split('/');
      const monthYear = new Date(+year, +month - 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      if (!grouped.has(monthYear)) grouped.set(monthYear, []);
      grouped.get(monthYear)?.push(nota);
    });
    return Array.from(grouped, ([month, notas]) => ({ month, notas }));
  }
}
