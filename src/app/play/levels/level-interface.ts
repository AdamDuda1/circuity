import { Globals } from '../../globals';

export abstract class Level {
	id = '';
	abstract name: string;
	abstract descriptionHtml: string;
	abstract restrictComponentList: boolean;
	abstract allowedComponents: string[];
	abstract usedIO: string[];
	abstract solution: string;

	abstract verify(globals: Globals): boolean;

	simulateSimulation(globals: Globals) {
		for (let i = 0; i < globals.simulation.circuitComponents().length; ++i) {
			const components = globals.simulation.circuitComponents();
			globals.simulation.channels.fill(false);

			for (let index = 0; index < components.length; index++) {
				const component = components[index];
				if (component.deleted) continue;
				if (component.name === 'Signal Receiver') continue;

				component.simulate();
			}

			for (let index = 0; index < components.length; index++) {
				const component = components[index];
				if (component.deleted) continue;
				if (!(component.name === 'Signal Receiver')) continue;

				component.simulate();
			}
		}
	}
}
