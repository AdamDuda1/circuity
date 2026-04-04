import { Globals } from './globals';
import { _Toast } from './toasts';
import { SerializedElectricalComponent } from './components/component-type-interface'; // type ( .. ????

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
		return {
			components: this.globals.simulation.circuitComponents().map(c => c.getComponentJSON()),
			view: {
				x: this.globals.view().x,
				y: this.globals.view().y,
				z: this.globals.view().z
			}
		} as SavedState;
	}

	loadJSON(json: SavedState) {
		try {
			const state: SavedState = json;

			this.globals.simulation.circuitComponents.set([]);

			for (const comp of state.components) {
				const factory = this.globals.componentRegistry.get(comp.name);
				if (!factory) {
					console.error(`Unknown component type while loading: ${comp.name}`);
					return false;
				}

				const component = factory(true, comp.x, comp.y);
				component.spawnComponentFromJSON(comp);
				this.globals.simulation.circuitComponents().push(component);
			}

			if (state.view) {
				this.globals.view.update(v => ({...v, ...state.view}));
			}

			return true;
		} catch (e) {
			console.error('Failed to load simulation:', e);
			localStorage.removeItem('simulationData');
			return false;
		}
	}
}
