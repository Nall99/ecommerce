import { TestBed } from '@angular/core/testing';
import { CartPromptService } from './cart-prompt.service';

describe('CartPromptService', () => {
  let service: CartPromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartPromptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
