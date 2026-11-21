import { Injectable, signal } from '@angular/core';

const SHOW_AFTER_MS = 400; // evita piscar em respostas rápidas
const SLOW_AFTER_MS = 6000; // depois disso, explica a demora

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = 0;
  private showTimer?: ReturnType<typeof setTimeout>;
  private slowTimer?: ReturnType<typeof setTimeout>;

  private readonly _visible = signal(false);
  private readonly _slow = signal(false);

  readonly visible = this._visible.asReadonly();
  readonly slow = this._slow.asReadonly();

  start() {
    this.pending++;
    if (this.pending > 1) return;

    this.showTimer = setTimeout(() => this._visible.set(true), SHOW_AFTER_MS);
    this.slowTimer = setTimeout(() => this._slow.set(true), SLOW_AFTER_MS);
  }

  stop() {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending > 0) return;

    clearTimeout(this.showTimer);
    clearTimeout(this.slowTimer);
    this._visible.set(false);
    this._slow.set(false);
  }
}