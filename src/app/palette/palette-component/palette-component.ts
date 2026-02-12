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

    onDragStart(event: DragEvent): void {
        if (!event.dataTransfer) return;

        event.dataTransfer.effectAllowed = 'all'; // modify with event.dataTransfer.dropEffect in canvas.ts
        event.dataTransfer.setData('application/circuity-component', this.component().name);
    }

    onDoubleClick(): void {
        this.globals.simulation.spawnComponent(this.component().name, -this.globals.view().x, this.globals.view().y); // TODO why -x ??
    }
}
