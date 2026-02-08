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
import { Globals } from '../globals';

@Component({
    selector: 'app-canvas',
    imports: [],
    templateUrl: './canvas.html',
    styleUrl: './canvas.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Canvas implements AfterViewInit, OnDestroy {
    constructor(public globals: Globals) {}

    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

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

        this.simulation.circuitComponents().push(new AND(this.globals, 0, 0));
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
        const v = this.globals.view();
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
        const rect = this.canvasRef().nativeElement.getBoundingClientRect();

        if (this.isPanning()) {
            const last = this.lastPointer();
            const z = this.globals.view().z;
            this.globals.view.update((v) => ({...v, x: v.x + (event.clientX - last.x) / z, y: v.y + (event.clientY - last.y) / z}));
            this.lastPointer.set({x: event.clientX, y: event.clientY});
        }

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.globals.cursor.update(() => ({
            x: (-mouseX + this.globals.view().w / 2 + this.globals.view().x) / this.globals.view().z,
            y: (-mouseY + this.globals.view().h / 2 + this.globals.view().y) / this.globals.view().z
        }));
    }

    onPointerUp(event: PointerEvent) {
        this.isPanning.set(false);
        (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    }

    private startLoop(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;

        let last = performance.now();

        const tick = () => {
            const now = performance.now();
            this.globals.frame.update((v) => ({...v, dt: now - last}));
            this.globals.frame.update((v) => ({...v, fps: this.globals.frame().dt > 0 ? 1000 / this.globals.frame().dt : 0}));
            last = now;

            const v = this.globals.view();
            const nextZ = v.z + (this.targetZ() - v.z) * 0.15;
            if (Math.abs(nextZ - v.z) > 0.0001) {
                this.globals.view.update((prev) => ({...prev, z: nextZ}));
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

        this.globals.view.update((v) => ({...v, w: rect.width, h: rect.height, dpr}));
    }

    draw(ctx: CanvasRenderingContext2D) {
        const {w, h, dpr} = this.globals.view();

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        this.drawer.drawGrid(ctx);
        this.drawer.drawWorld(this.ctx, this.simulation);
        this.drawer.drawDebug(ctx);
    }

    private clamp(value: number, min: number, max: number) {
        return Math.min(max, Math.max(min, value));
    }
}
