import { Level } from './level-interface';

export class AndLevel extends Level {
	id = '2';
	name = 'Make AND';
	descriptionHtml = 'Build an <b>AND</b> gate from NAND or NOR combinations.';

	verify(): boolean {
		return true;
	}
}

