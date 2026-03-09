import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Globals } from '../globals';
import { NgOptimizedImage } from '@angular/common';

@Component({
	selector: 'app-tutorial',
	templateUrl: './tutorial.html',
	styleUrl: './tutorial.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tutorial {
	constructor(public globals: Globals) {}

	public pages = 3;

	open() {
		this.globals.tutorial_page.set(0);
		this.globals.tutorial_open.set(true);
	}

	close() {
		this.globals.tutorial_open.set(false);
		localStorage.setItem('tutorial', 'true');
	}

	nextPage() {
		if (this.globals.tutorial_page() + 1 == this.pages) {
			this.close();
			return;
		}
		this.globals.tutorial_page.update(p => p + 1);
	}

	prevPage() {
		if (this.globals.tutorial_page() != 0) this.globals.tutorial_page.update(p => p - 1);
	}
}
