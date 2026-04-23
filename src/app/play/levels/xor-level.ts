import { Level } from './level-interface';

export class XorLevel extends Level {
	name = 'Make XOR';
	descriptionHtml = 'Build a <b>XOR</b> gate from basic gates.';
	restrictComponentList = false;
	allowedComponents = [];

	verify(): boolean {
		return true;
	}
}

