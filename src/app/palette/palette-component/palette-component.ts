import { ChangeDetectionStrategy, input, Component, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ElectricalComponent } from '../../components/component-type-interface';

@Component({
    selector: 'app-palette-component',
    imports: [],
    templateUrl: './palette-component.html',
    styleUrl: './palette-component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaletteComponent implements AfterViewInit {
    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
    component = input.required<ElectricalComponent>();

    async ngAfterViewInit() {
        const canvas = this.canvasRef().nativeElement;
        let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

        let view = signal({x: 5, y: 11, z: 8, w: -1, h: -1});
        this.component().setSize((canvas.width - 30) / 10, (canvas.height - 30) / 10);
        this.component().render(ctx, view()); // y = 26 * 5 + 20 (margin)

        canvas.parentElement!.addEventListener('dragstart', (event) => {
            const preview = document.createElement('div');
            preview.style.width = '50px';
            preview.style.height = '50px';
            preview.style.background = 'red';
            document.body.appendChild(preview);

            event.dataTransfer!.setDragImage(preview, 25, 25);

            event.dataTransfer!.setData('text/plain', JSON.stringify({shape: 'circle'}));
        });
    }
}
