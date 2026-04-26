import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';

export class AndsAndOrsLevel extends Level {
	name = 'ANDs and ORs';
	descriptionHtml = 'The LED (name <b>output</b>) should light up when both switches with names <b>A and B or</b> <b>C and' +
		' D</b> are on.';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'LED', 'OR', 'AND'];
	usedIO = ['a', 'b', 'c', 'd', 'output'];
	solution = "{\"components\":[{\"type\":\"Switch\",\"x\":-85,\"y\":65,\"label\":\"A\",\"showLabel\":true,\"outTo\":[[{\"component\":5,\"pin\":1}],[]]},{\"type\":\"Switch\",\"x\":-85,\"y\":15,\"label\":\"B\",\"showLabel\":true,\"outTo\":[[{\"component\":5,\"pin\":0}],[]]},{\"type\":\"Switch\",\"x\":-85,\"y\":-35,\"label\":\"C\",\"showLabel\":true,\"outTo\":[[{\"component\":6,\"pin\":1}],[]]},{\"type\":\"Switch\",\"x\":-85,\"y\":-85,\"label\":\"D\",\"showLabel\":true,\"outTo\":[[{\"component\":6,\"pin\":0}],[]]},{\"type\":\"OR\",\"x\":15,\"y\":-10,\"inFrom\":[{\"component\":6,\"pin\":0},{\"component\":5,\"pin\":0}],\"outTo\":[[{\"component\":7,\"pin\":0}],[]]},{\"type\":\"AND\",\"x\":-35,\"y\":15,\"inFrom\":[{\"component\":1,\"pin\":0},{\"component\":0,\"pin\":0}],\"outTo\":[[{\"component\":4,\"pin\":1}],[]]},{\"type\":\"AND\",\"x\":-35,\"y\":-35,\"inFrom\":[{\"component\":3,\"pin\":0},{\"component\":2,\"pin\":0}],\"outTo\":[[{\"component\":4,\"pin\":0}],[]]},{\"type\":\"LED\",\"x\":65,\"y\":-10,\"label\":\"output\",\"showLabel\":true,\"inFrom\":[{\"component\":4,\"pin\":0},{\"component\":-1,\"pin\":-1}]}],\"view\":{\"x\":0,\"y\":0,\"z\":2}}";

	verify(globals: Globals): boolean {
		const components = globals.simulation.circuitComponents();
		const getByName = (name: string) => components.find((component) => !component.deleted && component.getDisplayLabel().trim().toLowerCase() === name);

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

