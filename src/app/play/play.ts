import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEVELS } from './levels';

@Component({
	selector: 'app-play',
	imports: [RouterLink],
	templateUrl: './play.html',
	styleUrl: './play.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Play {
	readonly levels = LEVELS;
	private readonly solvedDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

	get solvedCount(): number {
		return this.levels.filter((level) => this.isSolved(level.id)).length;
	}

	isSolved(levelId: string): boolean {
		const storedValue = this.getStoredSolvedValue(levelId);
		if (storedValue === 'true') {
			return true;
		}

		if (!storedValue) {
			return false;
		}

		return this.parseSolvedDate(storedValue) !== null;
	}

	getSolvedStatusLabel(levelId: string): string {
		const storedValue = this.getStoredSolvedValue(levelId);
		if (storedValue === 'true') {
			return 'Solved';
		}

		const solvedDate = storedValue ? this.parseSolvedDate(storedValue) : null;
		if (solvedDate) {
			return `Solved on ${this.solvedDateFormatter.format(solvedDate)}`;
		}

		return 'Not solved';
	}

	private getStoredSolvedValue(levelId: string): string | null {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem(`level${levelId}`);
	}

	private parseSolvedDate(value: string): Date | null {
		const solvedDate = new Date(value);
		return Number.isNaN(solvedDate.getTime()) ? null : solvedDate;
	}
}
