import { Component, effect, input, signal } from '@angular/core';
import { Level } from '../levels/level-interface';

@Component({
	selector: 'app-level-info',
	imports: [],
	templateUrl: './level-info.html',
	styleUrl: './level-info.css'
})
export class LevelInfo {
	readonly level = input.required<Level>();
	readonly verifyResult = signal<boolean | null>(null);

	constructor() {
		effect(() => {
			const level = this.level();
			this.verifyResult.set(this.readSolved(level.id));
		});
	}

	verify(): void {
		const solved = this.level().verify();
		this.verifyResult.set(solved);
		if (solved) {
			this.saveSolved(this.level().id);
		}
	}

	private saveSolved(levelId: string): void {
		if (typeof localStorage === 'undefined') {
			return;
		}

		localStorage.setItem(`level${levelId}`, 'true');
	}

	private readSolved(levelId: string): boolean {
		if (typeof localStorage === 'undefined') {
			return false;
		}

		return localStorage.getItem(`level${levelId}`) === 'true';
	}
}
