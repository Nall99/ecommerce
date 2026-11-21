import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  imports: [],
  selector: 'app-loading-overlay',
  styleUrl: './loading-overlay.css',
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  protected readonly loading = inject(LoadingService);
}