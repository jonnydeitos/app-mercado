import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoProdutosPage } from './historico-produtos.page';

describe('HistoricoProdutosPage', () => {
  let component: HistoricoProdutosPage;
  let fixture: ComponentFixture<HistoricoProdutosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoProdutosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
