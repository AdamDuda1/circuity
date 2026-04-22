import { ChangeDetectionStrategy, input, Component, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ElectricalComponent } from '../../components/component-type-interface';
import { Globals } from '../../globals';

@Component({
	selector: 'app-palette-component',
	imports: [],
	templateUrl: './palette-component.html',
	styleUrl: './palette-component.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaletteComponent implements AfterViewInit {
	constructor(public globals: Globals) {}

	private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
	component = input.required<ElectricalComponent>();

	async ngAfterViewInit() {
		const canvas = this.canvasRef().nativeElement;
		const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

		const view = signal({x: 5, y: 11, z: 8, w: -1, h: -1});
		this.component().setSize((canvas.width - 30) / 10, (canvas.height - 30) / 10);
		this.component().render(ctx, view());
	}

	isFocused(): boolean {
		return this.globals.paletteComponentDetails()?.component === this.component();
	}

	isSelected(): boolean {
		return this.component().isSelected();
	}

	onShowDetails(event: MouseEvent | FocusEvent): void {
		const target = event.currentTarget;
		if (!(target instanceof HTMLElement)) return;

		this.globals.hoveredPaletteComponent.set(this.component());

		this.globals.showPaletteComponentDetails(this.component(), target.getBoundingClientRect().top);
	}

	onHideDetails(): void {
		this.globals.hoveredPaletteComponent.set(null);
		this.globals.hidePaletteComponentDetails(this.component());
	}

	onDragStart(event: DragEvent): void {
		if (!event.dataTransfer) return;

		event.dataTransfer.effectAllowed = 'all';
		event.dataTransfer.setData('application/circuity-component', this.component().name);
	}

	onKeyboardSpawn(event: KeyboardEvent): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		this.globals.simulation.spawnComponent(this.component().name, -this.globals.view().x, this.globals.view().y, true);
		this.globals.simulation.saveState("adding component")
	}

	onDoubleClick(): void {
		this.globals.simulation.spawnComponent(this.component().name, -this.globals.view().x, this.globals.view().y, true);
		this.globals.simulation.saveState("adding component")
	}
}
