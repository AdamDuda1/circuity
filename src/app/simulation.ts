import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { Globals } from './globals';
import { _Toast } from './toasts';

export class Simulation {
	constructor(public globals: Globals) {}

	public circuitComponents = signal<ElectricalComponent[]>([]);
	public running = signal(false);
	private readonly channels = new Array<boolean>(10).fill(false);
	history = signal<string[]>([]);
	currentVersion = signal<number>(0);

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
		const loaded = this.globals.data.loadJSON(parsedSnapshot as Parameters<typeof this.globals.data.loadJSON>[0], false, false);
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
		const loaded = this.globals.data.loadJSON(parsedSnapshot as Parameters<typeof this.globals.data.loadJSON>[0], false, false);
		if (!loaded) {
			_Toast.error('Failed to redo.');
			return;
		}

		this.currentVersion.set(nextVersion);
		_Toast.success('Redid!');
	}

	saveState() {
		if (this.running()) return;
		_Toast.success('saveState');

		const snapshot = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		this.history.update(prev => {
			const branchBase = this.currentVersion() > 0 ? prev.slice(this.currentVersion()) : prev;
			const max = Math.max(1, Math.floor(this.globals.historyMax));
			return [snapshot, ...branchBase.slice(0, max - 1)];
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
		const components = this.circuitComponents();
		const reachable = this.collectReachableFromSources(components);
		this.channels.fill(false);

		for (let index = 0; index < components.length; index++) {
			const component = components[index];
			if (component.deleted) continue;
			if (this.isSignalReceiver(component)) continue;

			if (reachable[index]) {
				component.simulate();
			} else {
				this.resetSignals(component);
			}
		}

		for (let index = 0; index < components.length; index++) {
			const component = components[index];
			if (component.deleted) continue;
			if (!this.isSignalReceiver(component)) continue;

			if (reachable[index]) {
				component.simulate();
			} else {
				this.resetSignals(component);
			}
		}
	}

	writeChannel(channel: number, state: boolean) {
		if (!state) return;
		this.channels[this.clampChannel(channel)] = true;
	}

	readChannel(channel: number): boolean {
		return this.channels[this.clampChannel(channel)];
	}

	private collectReachableFromSources(components: ElectricalComponent[]): boolean[] {
		const visited = new Array<boolean>(components.length).fill(false);
		const queue: number[] = [];

		for (let index = 0; index < components.length; index++) {
			const component = components[index];
			if (component.deleted) continue;
			if (component.noOfIns !== 0) continue;

			visited[index] = true;
			queue.push(index);
		}

		for (let head = 0; head < queue.length; head++) {
			const fromIndex = queue[head];
			const fromComponent = components[fromIndex];
			if (!fromComponent || fromComponent.deleted) continue;

			for (const connections of fromComponent.outTo) {
				if (!connections) continue;

				for (const connection of connections) {
					const toIndex = connection.component;
					if (toIndex < 0 || toIndex >= components.length) continue;
					if (visited[toIndex]) continue;

					const toComponent = components[toIndex];
					if (!toComponent || toComponent.deleted) continue;

					visited[toIndex] = true;
					queue.push(toIndex);
				}
			}
		}

		return visited;
	}

	private resetSignals(component: ElectricalComponent) {
		for (let i = 0; i < component.noOfIns; i++) {
			component.inStates[i] = false;
		}

		for (let i = 0; i < component.noOfOuts; i++) {
			component.outStates[i] = false;
		}
	}

	private clampChannel(channel: number): number {
		if (!Number.isFinite(channel)) return 0;
		const normalized = Math.round(channel);
		return Math.min(9, Math.max(0, normalized - 1));
	}

	private isSignalReceiver(component: ElectricalComponent): boolean {
		return component.name === 'Signal Receiver';
	}

	stop() {
		// TODO reset all states
	}
}
