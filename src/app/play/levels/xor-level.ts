import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';

export class XorLevel extends Level {
	name = 'Make a XOR!';
	descriptionHtml = 'Build an <b>exclusive OR</b> gate from basic gates. There should be two switches (<b>A</b>' +
		' and <b>B</b>) and one LED (<b>output</b>) which should light up only when one of the inputs are on (so' +
		' when one of them yes, but both or nither not).';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'LED', 'OR', 'AND', 'NOT'];
	usedIO = ['a', 'b', 'output'];
	solution = "{\"components\":[{\"type\":\"Switch\",\"x\":-60,\"y\":15,\"label\":\"A\",\"showLabel\":true,\"outTo\":[[{\"component\":2,\"pin\":1},{\"component\":4,\"pin\":1}],[]]},{\"type\":\"Switch\",\"x\":-60,\"y\":-35,\"label\":\"B\",\"showLabel\":true,\"outTo\":[[{\"component\":2,\"pin\":0},{\"component\":4,\"pin\":0}],[]]},{\"type\":\"AND\",\"x\":-10,\"y\":15,\"inFrom\":[{\"component\":1,\"pin\":0},{\"component\":0,\"pin\":0}],\"outTo\":[[{\"component\":3,\"pin\":0}],[]]},{\"type\":\"NOT\",\"x\":40,\"y\":15,\"inFrom\":[{\"component\":2,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"outTo\":[[{\"component\":5,\"pin\":1}],[]]},{\"type\":\"OR\",\"x\":-10,\"y\":-35,\"inFrom\":[{\"component\":1,\"pin\":0},{\"component\":0,\"pin\":0}],\"outTo\":[[{\"component\":5,\"pin\":0}],[]]},{\"type\":\"AND\",\"x\":40,\"y\":-35,\"inFrom\":[{\"component\":4,\"pin\":0},{\"component\":3,\"pin\":0}],\"outTo\":[[{\"component\":6,\"pin\":0}],[]]},{\"type\":\"LED\",\"x\":90,\"y\":-10,\"label\":\"output\",\"showLabel\":true,\"inFrom\":[{\"component\":5,\"pin\":0},{\"component\":-1,\"pin\":-1}]}],\"view\":{\"x\":0,\"y\":0,\"z\":2}}";

	verify(globals: Globals): boolean {
		const components = globals.simulation.circuitComponents();
		const getByName = (name: string) => components.find((component) => !component.deleted && component.getDisplayLabel().trim().toLowerCase() === name);

		const a = getByName('a') as Switch | undefined;
		const b = getByName('b') as Switch | undefined;
		const led = getByName('output');
		if (!a || !b || !led) return false;

		for (let mask = 0; mask < 4; mask++) {
			a.isOn = Boolean(mask & 1);
			b.isOn = Boolean(mask & 2);

			this.simulateSimulation(globals);

			const expected = a.isOn !== b.isOn;
			const ledState = Boolean(led.inStates[0]);
			if (ledState !== expected) return false;
		}

		return true;
	}
}

