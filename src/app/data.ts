import { Globals } from './globals';
import { _Toast } from './toasts';
import { ElectricalComponent, SerializedElectricalComponent } from './components/component-type-interface';

interface SavedState {
	components: SerializedElectricalComponent[];
	view: { x: number; y: number; z: number };
}

export class Data {
	constructor(public globals: Globals) {}

	loadLast(): boolean {
		const json = localStorage.getItem('save');
		if (!json) {
			_Toast.error("couldn't load last design :(");
			return false;
		}
		this.loadJSON(JSON.parse(json));
		_Toast.success("Loaded last design!");
		return true;
	}

	saveLast(silent = false) {
		localStorage.setItem('save', JSON.stringify(this.getCurrentDesignJSON()));
		if (!silent) {
			_Toast.success("Saved last!");
		} else _Toast.info("Saved last (but silent)!");
	}

	getCurrentDesignJSON() {
		let minX = 1e7, maxX = -1e7, minY = 1e7, maxY = -1e7;
		this.globals.simulation.circuitComponents().forEach((element) => {
			minX = Math.min(minX, element.x);
			maxX = Math.max(maxX, element.x);
			minY = Math.min(minY, element.y);
			maxY = Math.max(maxY, element.y);
		});

		return {
			components: this.globals.simulation.circuitComponents().map(c => this.getSparseComponentJSON(c)),
			view: {
				x: -(minX + maxX) / 2,
				y: (minY + maxY) / 2,
				z: this.globals.view().z
			}
		} as SavedState;
	}

	loadJSON(json: SavedState, resetHistory = true, changeView = true) {
		try {
			const state: SavedState = json;
			this.globals.clearSelected();
			this.globals.resetNextID(0);

			const loadedComponents: ElectricalComponent[] = [];

			for (const comp of state.components) {
				const factory = this.globals.componentRegistry.get(comp.name);
				if (!factory) {
					console.error(`Unknown component type while loading: ${comp.name}`);
					return false;
				}

				const component = factory(true, comp.x, comp.y);
				component.spawnComponentFromJSON(comp);
				loadedComponents.push(component);
			}

			this.globals.simulation.circuitComponents.set(loadedComponents);

			if (state.view && changeView) this.globals.view.update(v => ({...v, ...state.view}));

			if (resetHistory) {
				this.globals.simulation.history.set([JSON.stringify(state)]);
				this.globals.simulation.currentVersion.set(0);
			}

			return true;
		} catch (e) {
			console.error('Failed to load simulation:', e);
			localStorage.removeItem('simulationData');
			return false;
		}
	}

	private getSparseComponentJSON(component: ElectricalComponent): SerializedElectricalComponent {
		const current = component.getComponentJSON();
		const sparse: SerializedElectricalComponent = {
			name: current.name,
			x: current.x,
			y: current.y
		};

		const factory = this.globals.componentRegistry.get(current.name);
		if (!factory) {
			return sparse;
		}

		const defaults = factory(false, current.x, current.y).getComponentJSON();
		const ignoredKeys = new Set<keyof SerializedElectricalComponent>([
			'name',
			'x',
			'y',
			'color',
			'description',
			'truthTable',
			'gif'
		]);

		for (const key of Object.keys(current) as (keyof SerializedElectricalComponent)[]) {
			if (ignoredKeys.has(key)) continue;
			const value = current[key];
			if (value === undefined) continue;

			if (!this.isDeepEqual(value, defaults[key])) {
				switch (key) {
					case 'showLabel':
						sparse.showLabel = value as boolean;
						break;
					case 'inFrom':
						sparse.inFrom = value as SerializedElectricalComponent['inFrom'];
						break;
					case 'outTo':
						sparse.outTo = value as SerializedElectricalComponent['outTo'];
						break;
					case 'custom':
						sparse.custom = value as SerializedElectricalComponent['custom'];
						break;
				}
			}
		}

		return sparse;
	}

	private isDeepEqual(a: unknown, b: unknown): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}
}
