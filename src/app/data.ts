import { Globals } from './globals';
import { _Toast } from './toasts';
import { ElectricalComponent, SerializedElectricalComponent } from './components/component-type-interface'; // type ( .. ????

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

	saveLast() {
		localStorage.setItem('save', JSON.stringify(this.getCurrentDesignJSON()));
		_Toast.success("Saved last!");
	}

	getCurrentDesignJSON() {
		let minX = 1e7, maxX = -1e7, minY = 1e7, maxY = -1e7;
		this.globals.simulation.circuitComponents().forEach((element) => {
			minX = Math.min(minX, element.x);
			maxX = Math.max(maxX, element.x);
			minY = Math.min(minY, element.y);
			maxY = Math.max(maxY, element.y);
		});

		console.log(minX, maxX, minY, maxY);

		return {
			components: this.globals.simulation.circuitComponents().map(c => c.getComponentJSON()),
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
			this.globals.selected = -1;
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
}
