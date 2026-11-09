import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router)
  protected readonly cart = inject(CartService);

  search(term: string){
    this.router.navigate(['/produtos'], {
      queryParams: { search: term.trim() || null, page: null },
      queryParamsHandling: 'merge',
     });
  }
}
