import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  host: { class: 'flex min-h-screen flex-col' },
  styleUrl: './app.css'
})
export class App {}
