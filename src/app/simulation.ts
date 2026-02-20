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

	spawnComponent(name: string, x: number, y: number) {
		if (this.globals.simulation.running()) return;

		const factory = this.globals.componentRegistry.get(name);
		if (!factory) return;

		this.globals.simulation.circuitComponents().push(factory(this.globals, true, x, y));
	}

	simulate() {
		for (const component of this.circuitComponents()) component.simulate();
	}

	stop() {
		// TODO reset all states
	}
}
