import { Level } from './level-interface';

export class XorLevel extends Level {
	id = '1';
	name = 'Make XOR';
	descriptionHtml = 'Build a <b>XOR</b> gate from basic gates.';

	verify(): boolean {
		return true;
	}
}

