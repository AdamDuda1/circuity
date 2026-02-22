import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { Globals } from './globals';

export class Simulation {
	constructor(public globals: Globals) {}

	public circuitComponents = signal<ElectricalComponent[]>([]);
	public running = signal(false);

	switch() {
		this.running.set(!this.running());
	}

	spawnComponent(name: string, x: number, y: number, thoseWereCenterCoordinates = false) {
		if (this.globals.simulation.running()) return;

		const factory = this.globals.componentRegistry.get(name);
		if (!factory) return;

		const component = factory(this.globals, true, x, y);

		if (thoseWereCenterCoordinates) {
			x -= component.w / 2;
			y -= component.h / 2;
		}

		this.globals.simulation.circuitComponents().push(factory(this.globals, true, x, y));
	}

	simulate() {
		for (const component of this.circuitComponents()) component.simulate();
	}

	stop() {
		// TODO reset all states
	}
}
