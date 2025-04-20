import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProdutoHistorico {
  id: string;
  nome: string;
  categoria: string;
  empresa: string;
  data: string;
  valor_unitario: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://mercado-backend-cyne.onrender.com';

  constructor(private http: HttpClient) {}

  getProdutos(): Observable<ProdutoHistorico[]> {
    return this.http.get<ProdutoHistorico[]>(`${this.apiUrl}/produtos`);
  }

  getLancamentos(nome: string, ano: number): Observable<ProdutoHistorico[]> {
    return this.http.get<ProdutoHistorico[]>(
      `${this.apiUrl}/produtos/${nome}/lancamentos?ano=${ano}`
    );
  }

  adicionarProduto(produto: ProdutoHistorico): Observable<ProdutoHistorico> {
    return this.http.post<ProdutoHistorico>(`${this.apiUrl}/produtos`, produto);
  }

  deletarProdutos(empresa: string, data: string): Observable<any> {
    console.log(`Data recebida para formatação: ${data}`);
    if (!data || typeof data !== 'string') {
      throw new Error('Data inválida ou ausente para exclusão');
    }
    const formattedData = this.formatarData(data);
    console.log(`Enviando DELETE para empresa=${empresa} e data=${formattedData}`);
    return this.http.delete(`${this.apiUrl}/produtos`, {
      params: { empresa, data: formattedData },
    });
  }

  private formatarData(data: string): string {
    // Verificar se a data está no formato ISO (ex.: 2025-04-03T00:00:00.000Z)
    if (data.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
      const dateObj = new Date(data);
      const ano = dateObj.getFullYear();
      const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // +1 porque getMonth() retorna 0-11
      const dia = dateObj.getDate().toString().padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    }

    // Caso a data esteja no formato DD/MM/YYYY
    const partes = data.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      if (!dia || !mes || !ano) {
        throw new Error(`Componente da data ausente: ${data}`);
      }

      const diaNum = parseInt(dia, 10);
      const mesNum = parseInt(mes, 10);
      const anoNum = parseInt(ano, 10);
      if (isNaN(diaNum) || isNaN(mesNum) || isNaN(anoNum)) {
        throw new Error(`Componente da data não é um número válido: ${data}`);
      }

      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    throw new Error(`Formato de data inválido: ${data}. Esperado DD/MM/YYYY ou formato ISO`);
  }
}