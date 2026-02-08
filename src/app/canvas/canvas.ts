import {
    Component,
    AfterViewInit,
    ElementRef,
    ChangeDetectionStrategy,
    OnDestroy,
    signal,
    viewChild,
    inject
} from '@angular/core';
import { CanvasDraw } from './canvas-draw-misc';
import { Simulation } from '../simulation';
import { AND } from '../components/and';
import { OR } from '../components/or';
import { NOT } from '../components/not';

@Component({
    selector: 'app-canvas',
    imports: [],
    templateUrl: './canvas.html',
    styleUrl: './canvas.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Canvas implements AfterViewInit, OnDestroy {
    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    public readonly view = signal({x: 0, y: 0, z: 1, w: 0, h: 0, dpr: 1, maxWorldX: 0, minWorldX: 0, maxWorldY: 0, minWorldY: 0});
    protected readonly cursor = signal({x: 0, y: 0});
    protected readonly world = signal({w: 0, h: 0});
    protected readonly frame = signal({dt: 0, fps: 0});

    protected readonly isPanning = signal(false);
    private readonly targetZ = signal(1);
    private readonly lastPointer = signal({x: 0, y: 0});

    public ctx!: CanvasRenderingContext2D;
    private animationRef = 0;
    private resizeObserver?: ResizeObserver;

    private drawer = inject(CanvasDraw);
    private simulation = inject(Simulation);

    ngAfterViewInit() {
        const canvas = this.canvasRef().nativeElement;

        this.updateCanvasSize(canvas);

        this.resizeObserver = new ResizeObserver(() => this.updateCanvasSize(canvas));
        this.resizeObserver.observe(canvas.parentElement!);

        this.simulation.circuitComponents().push(new AND(0, 0));
        this.simulation.circuitComponents().push(new OR(0, 40));
        this.simulation.circuitComponents().push(new NOT(0, 80));

        this.startLoop(canvas);
    }

    ngOnDestroy() {
        cancelAnimationFrame(this.animationRef);
        this.resizeObserver?.disconnect();
    }

    /*onWheel(event: WheelEvent) {
     event.preventDefault();
     const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
     this.targetZ.update((z) => this.clamp(z * factor, 0.2, 10));
     }*/

    onWheel(event: WheelEvent) {
        event.preventDefault();
        const v = this.view();
        const rawFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
        const nextZ = this.clamp(v.z * rawFactor, 0.2, 10);
        const factor = nextZ / v.z;

        this.targetZ.set(nextZ);
        this.targetZ.update((z) => this.clamp(z * factor, 0.2, 10));
    }

    onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        this.isPanning.set(true);
        this.lastPointer.set({x: event.clientX, y: event.clientY});
        (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
    }

    onPointerMove(event: PointerEvent) {
        this.cursor().x = (event.clientX - this.view().w / 2 - this.view().x) / this.view().z;
        this.cursor().y = (event.clientY - this.view().h / 2 - this.view().y) / this.view().z;

        if (!this.isPanning()) return;
        // this.ctx.canvas.style.cursor = 'grabbing'; // TODO cursors
        const last = this.lastPointer();
        const dx = (event.clientX - last.x) / this.view().z;
        const dy = (event.clientY - last.y) / this.view().z;
        this.lastPointer.set({x: event.clientX, y: event.clientY});
        this.view.update((v) => ({...v, x: v.x + dx, y: v.y + dy}));
    }

    onPointerUp(event: PointerEvent) {
        this.isPanning.set(false);
        (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    }

    private startLoop(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.drawer.initialize(this.ctx, this.view);

        let last = performance.now();

        const tick = () => {
            const now = performance.now();
            this.frame.update((v) => ({...v, dt: now - last}));
            this.frame.update((v) => ({...v, fps: this.frame().dt > 0 ? 1000 / this.frame().dt : 0}));
            last = now;

            const v = this.view();
            const nextZ = v.z + (this.targetZ() - v.z) * 0.15;
            if (Math.abs(nextZ - v.z) > 0.0001) {
                this.view.update((prev) => ({...prev, z: nextZ}));
            }

            this.simulation.simulate();
            this.draw(this.ctx);

            this.animationRef = requestAnimationFrame(tick);
        };

        this.animationRef = requestAnimationFrame(tick);
    }

    private updateCanvasSize(canvas: HTMLCanvasElement) {
        const host = canvas.parentElement ?? canvas;
        const rect = host.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(rect.width * dpr));
        const height = Math.max(1, Math.floor(rect.height * dpr));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        this.view.update((v) => ({...v, w: rect.width, h: rect.height, dpr}));
    }

    draw(ctx: CanvasRenderingContext2D) {
        const {w, h, dpr} = this.view();

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        this.drawer.drawGrid();
        this.drawer.drawWorld(this.ctx, this.simulation, this.view()); // TODO tidy up the func references
        this.drawer.drawDebug(ctx, this.frame(), this.view(), this.cursor());
    }

    private clamp(value: number, min: number, max: number) {
        return Math.min(max, Math.max(min, value));
    }
}
