import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Canvas} from './canvas/canvas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Canvas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('circuity');
}
