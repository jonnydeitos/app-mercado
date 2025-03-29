import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as cheerio from 'cheerio';

export interface NotaFiscal {
  empresa: string;
  data: string;
  itens: { nome: string; valorUnitario: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class NotaFiscalService {
  private proxyUrl = 'https://api-mercado-4p8h.onrender.com/proxy';

  constructor(private http: HttpClient) {}

  fetchNotaFiscalData(url: string): Observable<NotaFiscal> {
    return this.http
      .get(`${this.proxyUrl}?url=${encodeURIComponent(url)}`, {
        responseType: 'text',
      })
      .pipe(map((html) => this.parseNotaFiscal(html)));
  }

  private parseNotaFiscal(html: string): NotaFiscal {
    const $ = cheerio.load(html);

    // Nome do Estabelecimento
    const empresa =
      $('.txtCenter').first().text().trim() || 'Estabelecimento Não Encontrado';
    console.log('Empresa:', empresa);

    // Data
    const dataText = $('.txtCenter:contains("Emitida em")').text() || '';
    const dataMatch = dataText.match(/\d{2}\/\d{2}\/\d{4}/);
    const data = dataMatch
      ? dataMatch[0]
      : new Date().toLocaleDateString('pt-BR');
    console.log('Data:', data);

    // Itens e Valores
    const itens: { nome: string; valorUnitario: number }[] = [];
    $('#tabResult tr').each((_, element) => {
      const nome =
        $(element).find('.txtTit').text().trim() || 'Item Desconhecido';
      const valorText = $(element).find('.valor').text().trim() || '0';
      const valorUnitario = parseFloat(valorText.replace(',', '.')) || 0;
      if (nome && valorUnitario) {
        itens.push({ nome, valorUnitario });
      }
    });
    console.log('Itens:', itens);

    // Retorna apenas os campos solicitados
    return {
      empresa,
      data,
      itens: itens.length ? itens : [{ nome: 'Sem itens', valorUnitario: 0 }],
    };
  }
}
