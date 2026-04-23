import { Level } from './level-interface';

export class AndLevel extends Level {
	name = 'Make AND';
	descriptionHtml = 'Build an <b>AND</b> gate from NAND or NOR combinations.';
	restrictComponentList = false;
	allowedComponents = [];

	verify(): boolean {
		return true;
	}
}

