import { Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../levels/level-interface';
import { LEVELS } from '../levels';

@Component({
	selector: 'app-level-info',
	imports: [RouterLink],
	templateUrl: './level-info.html',
	styleUrl: './level-info.css'
})
export class LevelInfo {
	readonly level = input.required<Level>();
	readonly verifyResult = signal<boolean | null>(null);
	readonly currentIndex = computed(() => LEVELS.findIndex((level) => level.id === this.level().id));
	readonly previousLevelId = computed(() => {
		const index = this.currentIndex();
		return index > 0 ? LEVELS[index - 1].id : null;
	});
	readonly nextLevelId = computed(() => {
		const index = this.currentIndex();
		return index >= 0 && index < LEVELS.length - 1 ? LEVELS[index + 1].id : null;
	});

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
