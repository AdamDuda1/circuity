import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEVELS } from './levels';

@Component({
	selector: 'app-play',
	imports: [RouterLink],
	templateUrl: './play.html',
	styleUrl: './play.css'
})
export class Play {
	readonly levels = LEVELS;

	isSolved(levelId: string): boolean {
		if (typeof localStorage === 'undefined') {
			return false;
		}

		return localStorage.getItem(`level${levelId}`) === 'true';
	}
}
