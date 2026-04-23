import { Level } from './level-interface';
import { TutorialLevel } from './tutorial-level';
import { XorLevel } from './xor-level';
import { AndsAndOrsLevel } from './ands-and-ors-level';

export const LEVELS: readonly Level[] = [
	new TutorialLevel(),
	new AndsAndOrsLevel(),
	new XorLevel()
].map((level, index) => {
	level.id = String(index + 1);
	return level;
});

export function getLevelById(id: string | null): Level | undefined {
	return LEVELS.find(level => level.id === id);
}

