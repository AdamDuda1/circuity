import { ChangeDetectionStrategy, input, Component, signal, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ElectronicalComponent } from '../../components/component-type-interface';

@Component({
    selector: 'app-palette-component',
    imports: [],
    templateUrl: './palette-component.html',
    styleUrl: './palette-component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaletteComponent implements AfterViewInit {
    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
    component = input.required<ElectronicalComponent>();

    async ngAfterViewInit() {
        const canvas = this.canvasRef().nativeElement;
        let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

        let view = signal({x: 5, y: 4.5, z: 3});
        this.component().render(ctx, view(), canvas.width - 20, canvas.height - 20);


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
