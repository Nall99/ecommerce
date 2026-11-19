import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTotals } from './order-totals';

describe('OrderTotals', () => {
  let component: OrderTotals;
  let fixture: ComponentFixture<OrderTotals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTotals],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTotals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
