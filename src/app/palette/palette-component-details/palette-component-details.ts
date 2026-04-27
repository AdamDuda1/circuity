import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Globals } from '../../globals';

@Component({
	selector: 'app-palette-component-details',
	imports: [],
	templateUrl: './palette-component-details.html',
	styleUrl: './palette-component-details.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style.max-height.px]': 'maxHeight()',
		'[style.top.px]': 'top()',
		'[style.left.px]': '225'
	}
})
export class PaletteComponentDetails {
	private readonly globals = inject(Globals);
	private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
	readonly details = this.globals.paletteComponentDetails;
	private readonly previewCanvas = viewChild<ElementRef<HTMLCanvasElement>>('previewCanvas');
	readonly maxHeight = computed(() => {
		if (!this.details()) return 0;

		return Math.max(0, globalThis.innerHeight - this.top() - 10);
	});
	readonly top = computed(() => {
		const details = this.details();
		if (!details) return 0;

		const requestedTop = details?.top ?? 0;
		const panelHeight = this.hostElement.nativeElement.getBoundingClientRect().height;
		const maxTop = Math.max(0, globalThis.innerHeight - panelHeight - 10);
		return Math.min(requestedTop, maxTop);
	});
	readonly truthTableRows = computed(() => {
		const table = this.details()?.component.truthTable?.trim();
		if (!table) return [];

		return table.split(/\r?\n/).map(line => line.split('|').map(cell => cell.trim()));
	});
	readonly truthTableHead = computed(() => this.truthTableRows()[0] ?? []);
	readonly truthTableBody = computed(() => this.truthTableRows().slice(1));

	constructor() {
		effect(() => {
			const details = this.details();
			const canvas = this.previewCanvas()?.nativeElement;
			if (!details || !canvas) return;

			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const width = 120;
			const height = 90;
			const dpr = globalThis.devicePixelRatio || 1;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			const view = signal({x: 4, y: 7, z: 8, w: -1, h: -1});
			details.component.setSize((canvas.width - 30) / 10, (canvas.height - 30) / 10);
			details.component.render(ctx, view());
		});
	}
}
