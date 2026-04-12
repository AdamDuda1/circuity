import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { Globals } from './globals';
import { _Toast } from './toasts';
//import { min } from '@angular/forms/signals';

export class Simulation {
	constructor(public globals: Globals) {}

	public circuitComponents = signal<ElectricalComponent[]>([]);
	public running = signal(false);
	readonly MAX_HISTORY: number = 10; // lol cant be const cuz in class?
	history = signal<string[]>([]);
	currentVersion = signal<number>(0); // 0 is newest

	undo() {
		if (this.currentVersion() >= this.history().length - 1) {
			_Toast.error('No more history!');
			return;
		}

		const nextVersion = this.currentVersion() + 1;
		const snapshot = this.history()[nextVersion];
		if (!snapshot) {
			_Toast.error('Failed to undo.');
			return;
		}

		const parsedSnapshot: unknown = JSON.parse(snapshot);
		const loaded = this.globals.data.loadJSON(parsedSnapshot as Parameters<typeof this.globals.data.loadJSON>[0], false);
		if (!loaded) {
			_Toast.error('Failed to undo.');
			return;
		}

		this.currentVersion.set(nextVersion);
		_Toast.success('Undid!');
	}

	redo() {
		if (this.currentVersion() <= 0) {
			_Toast.error('No more history!');
			return;
		}

		const nextVersion = this.currentVersion() - 1;
		const snapshot = this.history()[nextVersion];
		if (!snapshot) {
			_Toast.error('Failed to redo.');
			return;
		}

		const parsedSnapshot: unknown = JSON.parse(snapshot);
		const loaded = this.globals.data.loadJSON(parsedSnapshot as Parameters<typeof this.globals.data.loadJSON>[0], false);
		if (!loaded) {
			_Toast.error('Failed to redo.');
			return;
		}

		this.currentVersion.set(nextVersion);
		_Toast.success('Redid!');
	}

	saveState() {
		if (this.running()) return;

		const snapshot = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		this.history.update(prev => {
			const branchBase = this.currentVersion() > 0 ? prev.slice(this.currentVersion()) : prev;
			return [snapshot, ...branchBase.slice(0, this.MAX_HISTORY - 1)];
		});
		this.currentVersion.set(0);
	}

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
