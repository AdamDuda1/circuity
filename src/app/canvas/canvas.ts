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
import { Globals } from '../globals';
import { drawWire } from '../components/wire';
import { LED } from '../components/led';

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
    protected readonly isConnecting = signal(false);
    protected readonly connectingFrom = signal({component: -1, type: 'in', index: -1});
    private readonly targetZ = signal(1);
    private readonly lastPointer = signal({x: 0, y: 0});
    private lastPinchDist = 0;

    private moved_amt = 0;
    public ctx!: CanvasRenderingContext2D;
    private animationRef = 0;
    private resizeObserver?: ResizeObserver;

    private drawer = inject(CanvasDraw);

    ngAfterViewInit() {
        const canvas = this.canvasRef().nativeElement;

        this.updateCanvasSize(canvas);

        this.resizeObserver = new ResizeObserver(() => this.updateCanvasSize(canvas));
        this.resizeObserver.observe(canvas.parentElement!);

        // this.globals.simulation.circuitComponents().push(new AND(this.globals, true, 0, -40));
        // this.globals.simulation.circuitComponents().push(new OR(this.globals, true, 0, -80));
        // this.globals.simulation.circuitComponents().push(new NOT(this.globals, true, 0, 0));
        this.globals.simulation.circuitComponents().push(new LED(this.globals, true, 0, 0));

        this.startLoop(canvas);
    }

    ngOnDestroy() {
        cancelAnimationFrame(this.animationRef);
        this.resizeObserver?.disconnect();
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

            this.globals.simulation.simulate();
            this.draw(this.ctx);
            this.globals.canvasCursor = this.globals.canvasCursorCandidate;

            this.animationRef = requestAnimationFrame(tick);
        };

        this.animationRef = requestAnimationFrame(tick);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const {w, h, dpr} = this.globals.view();

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        this.drawer.drawGrid(ctx);
        this.drawer.drawWorld(this.ctx, this.globals.simulation);
        this.drawer.drawDebug(ctx);

        if (this.isConnecting()) {
            const pos1 = this.connectingFrom();
            ctx.save();
            drawWire(ctx, this.globals.view(),
                {
                    x: this.globals.simulation.circuitComponents()[pos1.component].x +
                        (pos1.type == 'in' ? this.globals.simulation.circuitComponents()[pos1.component].ins
                            : this.globals.simulation.circuitComponents()[pos1.component].outs)[pos1.index].x,
                    y: this.globals.simulation.circuitComponents()[pos1.component].y +
                        (pos1.type == 'in' ? this.globals.simulation.circuitComponents()[pos1.component].ins
                            : this.globals.simulation.circuitComponents()[pos1.component].outs)[pos1.index].y
                },
                {x: this.globals.cursor().x, y: this.globals.cursor().y}
            );
            ctx.restore();
        }
    }


    // MOVEMENT AND ZOOM (DESKTOP)

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
        if (event.pointerType === 'touch' && this.isPanning()) return; // ignore second touch for panning

        this.isPanning.set(true);
        this.lastPointer.set({x: event.clientX, y: event.clientY});
        (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);

        if (this.globals.selected != -1) this.globals.selected = -1;
        for (const component of this.globals.simulation.circuitComponents()) {
            if (component.mouseOverComponent()) {
                this.globals.selected = component.id;
                break;
            }
        }

        for (const component of this.globals.simulation.circuitComponents()) {
            const ans = component.mouseOverPin();
            if (ans.index != -1) {
                /*if (ans.type === 'in' && component.inFrom[ans.index].component != -1) {
                 const from = component.inFrom[ans.index];
                 this.globals.simulation.circuitComponents()[from.component].outTo[from.pin] = this.globals.simulation.circuitComponents()[from.component].outTo[from.pin].filter(c => c.component !== component.id || c.pin !== ans.index);
                 component.inFrom[ans.index] = {component: -1, pin: -1};
                 break;
                 }*/
                //if (this.globals.simulation.circuitComponents()[search.index].) {}
                this.isConnecting.set(true);
                this.isPanning.set(false);
                this.connectingFrom.set({component: component.id, type: ans.type, index: ans.index});
                break;
            }
        }
    }

    onPointerUp(event: PointerEvent) {
        if (this.isConnecting()) {
            this.isConnecting.set(false);

            for (const component of this.globals.simulation.circuitComponents()) {
                const ans = component.mouseOverPin();
                if (ans.index != -1) {
                    const to = {component: component.id, type: ans.type, index: ans.index};
                    const from = this.connectingFrom();

                    if (to.component === from.component) break;

                    if (from.type === 'out' && to.type === 'in') {
                        this.globals.simulation.circuitComponents()[to.component].inFrom[to.index] = {component: from.component, pin: from.index};
                        if (!this.globals.simulation.circuitComponents()[from.component].outTo[from.index])
                            this.globals.simulation.circuitComponents()[from.component].outTo[from.index] = [];
                        this.globals.simulation.circuitComponents()[from.component].outTo[from.index].push({component: to.component, pin: to.index});
                    } else if (from.type === 'in' && to.type === 'out') {
                        this.globals.simulation.circuitComponents()[from.component].inFrom[from.index] = {component: to.component, pin: to.index};
                        if (!this.globals.simulation.circuitComponents()[to.component].outTo[to.index])
                            this.globals.simulation.circuitComponents()[to.component].outTo[to.index] = [];
                        this.globals.simulation.circuitComponents()[to.component].outTo[to.index].push({component: from.component, pin: from.index});
                    }
                    break;
                }
            }
        }

        this.isPanning.set(false);
        (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
        if (this.moved_amt > 5) this.globals.selected = -1;
        this.moved_amt = 0;
    }

    onPointerMove(event: PointerEvent) {
        const rect = this.canvasRef().nativeElement.getBoundingClientRect();

        if (this.isPanning() && !this.isConnecting()) {
            this.moved_amt++;
            const last = this.lastPointer();
            const z = this.globals.view().z;

            if (this.globals.selected != -1) {
                this.globals.simulation.circuitComponents()[this.globals.selected].updatePos((event.clientX - last.x) / z, -(event.clientY - last.y) / z);
                //console.log(this.globals.simulation.circuitComponents());
            } else {
                this.globals.view.update((v) => ({
                    ...v,
                    x: v.x + (event.clientX - last.x) / z,
                    y: v.y + (event.clientY - last.y) / z
                }));
            }

            this.lastPointer.set({x: event.clientX, y: event.clientY});
        }

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.globals.cursor.update(() => ({
            x: (mouseX - this.globals.view().w / 2) / this.globals.view().z - this.globals.view().x,
            y: -(mouseY - this.globals.view().h / 2) / this.globals.view().z + this.globals.view().y
        }));

        // SETTING CURSOR
        let candidate = 'default';
        for (const component of this.globals.simulation.circuitComponents()) {
            if (component.mouseOverComponent()) {
                candidate = 'pointer';
                break;
            }
        }

        for (const component of this.globals.simulation.circuitComponents()) {
            if (component.mouseOverPin().index != -1) {
                candidate = 'crosshair';
                break;
            }
        }

        this.globals.canvasCursorCandidate = candidate;
    }


    // TOUCH EVENTS FOR MOBILE MOVEMENT

    onTouchStart(event: TouchEvent) {
        if (event.touches.length === 2) {
            event.preventDefault();
            this.lastPinchDist = this.getPinchDistance(event.touches);
        }
    }

    onTouchMove(event: TouchEvent) {
        if (event.touches.length === 2) {
            event.preventDefault();
            const dist = this.getPinchDistance(event.touches);
            if (this.lastPinchDist > 0) {
                const factor = dist / this.lastPinchDist;
                const v = this.globals.view();
                const nextZ = this.clamp(v.z * factor, 0.2, 10);
                this.targetZ.set(nextZ);
                this.globals.view.update((prev) => ({...prev, z: nextZ}));
            }
            this.lastPinchDist = dist;
        }
    }

    onTouchEnd(event: TouchEvent) {
        if (event.touches.length < 2) {
            this.lastPinchDist = 0;
        }
    }


    // DRAG AND DROP

    onDragOver(event: DragEvent): void {
        if (event.dataTransfer?.types.includes('application/circuity-component')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        }
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();

        const componentName = event.dataTransfer?.getData('application/circuity-component');
        if (!componentName) return;

        const rect = this.canvasRef().nativeElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const worldX = (mouseX - this.globals.view().w / 2) / this.globals.view().z - this.globals.view().x;
        const worldY = -(mouseY - this.globals.view().h / 2) / this.globals.view().z + this.globals.view().y;

        this.globals.simulation.spawnComponent(componentName, worldX, worldY);
    }


    // MISC AND HELPERS

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

    private getPinchDistance(touches: TouchList): number {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private clamp(value: number, min: number, max: number) { // c++ :)
        return Math.min(max, Math.max(min, value));
    }
}
