import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { Globals } from './globals';

export class Simulation {
	constructor(public globals: Globals) {}

	public circuitComponents = signal<ElectricalComponent[]>([]);
	public running = signal(false);

	switch() {
		if (this.running()) this.globals.simulation.stop();
		else this.globals.selected = -1;
		this.running.set(!this.running());
	}

	spawnComponent(name: string, x: number, y: number, thoseWereCenterCoordinates = false) {
		if (this.globals.simulation.running()) return;

		const factory = this.globals.componentRegistry.get(name);
		if (!factory) return;

		const component = factory(true, x, y);

		if (thoseWereCenterCoordinates) {
			component.updatePos(-component.w / 2, -component.h / 2);
		}

		this.globals.simulation.circuitComponents().push(component);
	}

	simulate() {
		for (const component of this.circuitComponents()) component.simulate();
	}

	stop() {
		// TODO reset all states
	}
}
