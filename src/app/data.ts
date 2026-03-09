import { Globals } from './globals';
import { Toast } from './toasts';

interface SavedComponent {
	name: string;
	color: string;
	x: number;
	y: number;
	showLabel: boolean;
	inFrom: { component: number; pin: number }[];
	outTo: { component: number; pin: number }[][];
}

interface SavedState {
	components: SavedComponent[];
	view: { x: number; y: number; z: number };
}

export class Data {
	constructor(public globals: Globals) {}

	save() {
		const state: SavedState = {
			components: this.globals.simulation.circuitComponents().map(c => ({
				name: c.name,
				color: c.color,
				x: c.x,
				y: c.y,
				showLabel: c.showLabel,
				inFrom: c.inFrom,
				outTo: c.outTo
			})),
			view: {
				x: this.globals.view().x,
				y: this.globals.view().y,
				z: this.globals.view().z
			}
		};
		localStorage.setItem('simulationData', JSON.stringify(state));

		Toast.success("Saved!");
	}

	load(): boolean {
		const json = localStorage.getItem('simulationData');
		if (!json) return false;

		try {
			const state: SavedState = JSON.parse(json);

			this.globals.simulation.circuitComponents.set([]);

			for (const comp of state.components) {
				this.globals.simulation.spawnComponent(comp.name, comp.x, comp.y);
			}

			const components = this.globals.simulation.circuitComponents();
			for (let i = 0; i < components.length; i++) {
				const component = components[i];
				const savedComp = state.components[i];

				component.color = savedComp.color;
				component.showLabel = savedComp.showLabel;

				component.inFrom = savedComp.inFrom.map(item => ({...item}));

				component.outTo = savedComp.outTo.map(arr => arr.map(item => ({...item})));
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
