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
    const formattedData = this.formatarData(data);
    console.log(`Enviando DELETE para empresa=${empresa} e data=${formattedData}`);
    return this.http.delete(`${this.apiUrl}/produtos`, {
      params: { empresa, data: formattedData },
    });
  }

  private formatarData(data: string): string {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
}