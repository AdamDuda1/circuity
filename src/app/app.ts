import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Canvas } from './canvas/canvas';
import { Palette } from './palette/palette';
import { SimulationControls } from './simulation-controls/simulation-controls';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Canvas, Palette, SimulationControls],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {

}