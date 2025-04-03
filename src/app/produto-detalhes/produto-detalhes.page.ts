import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, ProdutoHistorico } from '../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-produto-detalhes',
  templateUrl: './produto-detalhes.page.html',
  styleUrls: ['./produto-detalhes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
})
export class ProdutoDetalhesPage implements OnInit {
  @ViewChild('priceChart', { static: false })
  priceChartCanvas!: ElementRef<HTMLCanvasElement>;
  produto?: ProdutoHistorico;
  lancamentosFiltrados: ProdutoHistorico[] = [];
  currentYear = new Date().getFullYear();

  constructor(private router: Router, private apiService: ApiService) {}

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.produto = navigation.extras.state['produto'];
      await this.loadLancamentos();
      this.renderChart();
    }
  }

  async loadLancamentos() {
    this.apiService
      .getLancamentos(this.produto!.nome, this.currentYear)
      .subscribe({
        next: (rows: ProdutoHistorico[]) => {
          this.lancamentosFiltrados = rows;
        },
        error: (err: any) => {
          console.error('Erro ao carregar lançamentos:', err);
        },
      });
  }

  renderChart() {
    if (!this.lancamentosFiltrados.length || !this.priceChartCanvas) return;

    const meses = Array(12)
      .fill(0)
      .map((_, i) =>
        new Date(this.currentYear, i, 1).toLocaleString('default', {
          month: 'short',
        })
      );
    const valores = meses.map((_, mes) => {
      const lancamento = this.lancamentosFiltrados.find((l) => {
        const date = new Date(l.data);
        return date.getMonth() === mes;
      });
      return lancamento ? lancamento.valor_unitario : null;
    });

    new Chart(this.priceChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Preço (R$)',
            data: valores,
            borderColor: '#007bff',
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}
