import { Component, signal } from '@angular/core';
import { Globals } from '../globals';

@Component({
	selector: 'app-simulation-controls',
	imports: [],
	templateUrl: './simulation-controls.html',
	styleUrl: './simulation-controls.css'
})
export class SimulationControls {
	constructor(public globals: Globals) {}

	isHovered = signal(false);

	onClick() {
		this.globals.simulation.switch();
	}
}
