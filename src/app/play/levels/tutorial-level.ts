import { Level } from './level-interface';

export class TutorialLevel extends Level {
	name = 'Tutorial Level!';
	descriptionHtml = 'This level is here to make sure you know whats happening. It has a switch and an LED, and you just have to connect them together.';
	restrictComponentList = true;
	allowedComponents = ["Switch", "LED"];

	verify(): boolean {
		return true;
	}
}

