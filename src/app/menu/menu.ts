import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-menu',
	imports: [
		RouterLink
	],
	templateUrl: './menu.html',
	styleUrl: './menu.css',
	host: {
		'(document:pointerdown)': 'onDocumentClick($event)',
	},
})
export class Menu {
	currentPage = signal('Design');
	details = viewChild<ElementRef<HTMLDetailsElement>>('details');

	switchPage(page: string) {
		this.currentPage.set(page);
	}

	onDocumentClick(event: Event) {
		const el = this.details()?.nativeElement;
		if (el && !el.contains(event.target as Node)) {
			el.open = false;
		}
	}
}
