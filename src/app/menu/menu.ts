import { Component, computed, viewChild, ElementRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
	private router = inject(Router);
	private url = toSignal(this.router.events.pipe(map(() => this.router.url)), {
		initialValue: this.router.url,
	});

	currentPage = computed(() => {
		const url = this.url();
		if (url.startsWith('/browse')) return 'Browse';
		if (url.startsWith('/blog')) return 'Blog';
		return 'Design';
	});

	details = viewChild<ElementRef<HTMLDetailsElement>>('details');

	onDocumentClick(event: Event) {
		const el = this.details()?.nativeElement;
		if (el && !el.contains(event.target as Node)) {
			el.open = false;
		}
	}
}
