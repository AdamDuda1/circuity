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
	solution = "";

	verify(globals: Globals): boolean {
		const components = globals.simulation.circuitComponents();
		const getByName = (name: string) => components.find((component) => !component.deleted && component.name.trim().toLowerCase() === name);

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

