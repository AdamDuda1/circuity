import { Level } from './level-interface';
import { AndLevel } from './and-level';
import { XorLevel } from './xor-level';

export const LEVELS: readonly Level[] = [new XorLevel(), new AndLevel()];

export function getLevelById(id: string | null): Level | undefined {
	return LEVELS.find(level => level.id === id);
}

