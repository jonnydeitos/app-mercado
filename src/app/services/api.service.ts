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
    return this.http.delete(`${this.apiUrl}/produtos`, {
      params: { empresa, data },
    });
  }
}
