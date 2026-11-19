import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CartPrompt {
  private readonly router = inject(Router);

  async itemAdded(productName: string) {
    const { default: Swal } = await import('sweetalert2');

    const result = await Swal.fire({
      icon: 'success',
      iconColor: '#1f6f5c',
      title: 'Adicionado ao carrinho!',
      text: productName,
      showCancelButton: true,
      confirmButtonText: 'Ir para o carrinho',
      cancelButtonText: 'Continuar comprando',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl',
        title: 'text-xl font-extrabold text-ink',
        htmlContainer: 'text-muted',
        actions: 'gap-3',
        confirmButton:
          'h-11 rounded-full bg-brand px-6 font-extrabold text-white hover:opacity-90',
        cancelButton:
          'h-11 rounded-full border-2 border-ink px-6 font-extrabold hover:bg-ink hover:text-white',
      },
    });

    if (result.isConfirmed) {
      this.router.navigate(['/carrinho']);
    }
  }
}