import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';

export class TutorialLevel extends Level {
	name = 'Tutorial Level!';
	descriptionHtml = 'When playing you will only be able' +
		' to use components from the allowed components list. They are displayed on the palette (in this case a button and LED) and you can use them as you would in the normal design. However, when playing, you have label specyfic components to' +
		' mark the inputs and outputs of your design. You can do this in the component properties tab. The names will be ginven in the level description and will highlight with purple when named correctly.<br><br>Try it yourself! Add a switch' +
		' (name <b>input</b>) and an LED (name <b>output</b>) and connect them.';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'LED'];
	usedIO = ['input', 'output'];
	solution = "";

	verify(globals: Globals): boolean {
		const button = globals.simulation.circuitComponents().find((component) => !component.deleted && component.name.trim().toLowerCase() === 'input') as Switch;
		const led = globals.simulation.circuitComponents().find((component) => !component.deleted && component.name.trim().toLowerCase() === 'output');
		if (!button || !led) return false;

		button.isOn = false;
		this.simulateSimulation(globals);
		if (led.inStates[0]) return false;

		button.isOn = true;
		this.simulateSimulation(globals);
		if (!led.inStates[0]) return false;

		return true;
	}
}

