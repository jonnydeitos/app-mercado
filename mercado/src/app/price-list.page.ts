import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotaFiscal } from './nota-fiscal.service';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
})
export class PriceListPage implements OnInit {
  notas: NotaFiscal[] = [];
  searchTerm: string = '';
  filteredNotas: NotaFiscal[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['notaData']) {
      this.notas.push(navigation.extras.state['notaData']);
      this.filteredNotas = [...this.notas];
    }
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
