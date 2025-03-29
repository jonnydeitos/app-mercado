import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceListPage } from './price-list.page';

describe('PriceListPage', () => {
  let component: PriceListPage;
  let fixture: ComponentFixture<PriceListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
