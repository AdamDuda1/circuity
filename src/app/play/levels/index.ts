import { Level } from './level-interface';
import { TutorialLevel } from './tutorial-level';
import { AndLevel } from './and-level';
import { XorLevel } from './xor-level';

export const LEVELS: readonly Level[] = [
	new TutorialLevel(),
	new XorLevel(),
	new AndLevel()
].map((level, index) => {
	level.id = String(index + 1);
	return level;
});

export function getLevelById(id: string | null): Level | undefined {
	return LEVELS.find(level => level.id === id);
}

