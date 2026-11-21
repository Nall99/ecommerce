import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { LoadingOverlay } from './shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, LoadingOverlay],
  templateUrl: './app.html',
  host: { class: 'flex min-h-screen flex-col' },
  styleUrl: './app.css'
})
export class App {}
