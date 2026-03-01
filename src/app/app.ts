import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Canvas } from './canvas/canvas';
import { Palette } from './palette/palette';
import { SimulationControls } from './simulation-controls/simulation-controls';
import { ComponentProperties } from './component-properties/component-properties';
import { Menu } from './menu/menu';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, Canvas, Palette, SimulationControls, ComponentProperties, Menu],
	templateUrl: './app.html',
	styleUrl: './app.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

}
