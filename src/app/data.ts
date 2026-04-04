import { Globals } from './globals';
import { _Toast } from './toasts';
import { SerializedElectricalComponent } from './components/component-type-interface'; // type ( .. ????

interface SavedState {
	components: SerializedElectricalComponent[];
	view: { x: number; y: number; z: number };
}

export class Data {
	constructor(public globals: Globals) {}

	save() {
		const state: SavedState = {
			components: this.globals.simulation.circuitComponents().map(c => c.getComponentJSON()),
			view: {
				x: this.globals.view().x,
				y: this.globals.view().y,
				z: this.globals.view().z
			}
		};
		localStorage.setItem('simulationData', JSON.stringify(state));

		_Toast.success("Saved!");
	}

	// TODO: getJSON(): record... ,  loadJSON(record...)

	load(): boolean {
		const json = localStorage.getItem('simulationData');
		if (!json) return false;

		try {
			const state: SavedState = JSON.parse(json);

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
