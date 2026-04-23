import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';

export class AndsAndOrsLevel extends Level {
	name = 'ANDs and ORs';
	descriptionHtml = 'The LED (name <b>output</b>) should light up when switches with name <b>A and B or C and D</b> are on.';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'LED', 'OR', 'AND'];
	usedIO = ['a', 'b', 'c', 'd', 'output'];
	solution = "";

	verify(globals: Globals): boolean {
		const components = globals.simulation.circuitComponents();
		const getByName = (name: string) => components.find((component) => !component.deleted && component.name.trim().toLowerCase() === name);

		const a = getByName('a') as Switch | undefined;
		const b = getByName('b') as Switch | undefined;
		const c = getByName('c') as Switch | undefined;
		const d = getByName('d') as Switch | undefined;
		const led = getByName('output');
		if (!a || !b || !c || !d || !led) return false;

		for (let mask = 0; mask < 16; mask++) {
			a.isOn = Boolean(mask & 1);
			b.isOn = Boolean(mask & 2);
			c.isOn = Boolean(mask & 4);
			d.isOn = Boolean(mask & 8);

			this.simulateSimulation(globals);

			const expected = (a.isOn && b.isOn) || (c.isOn && d.isOn);
			if ((led.inStates[0] ?? false) !== expected) return false;
		}

		return true;
	}
}

