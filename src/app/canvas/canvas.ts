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
import { Switch } from '../components/switch';
import { _Toast } from '../toasts';

@Component({
	selector: 'app-canvas',
	imports: [],
	templateUrl: './canvas.html',
	styleUrl: './canvas.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		//'(contextmenu)': 'openContextMenu($event)',
		'(document:keydown)': 'onKeyDown($event)'
	}
})
export class Canvas implements AfterViewInit, OnDestroy {
	constructor(public globals: Globals) {}

	private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

	protected readonly isConnecting = signal(false);
	protected readonly connectingToOrFrom = signal({component: -1, type: 'in', index: -1});
	private readonly targetZ = signal(2);
	private readonly lastPointer = signal({x: 0, y: 0});
	private lastPinchDist = 0;

	protected moved_amt = 0;
	private selectedBeforeDrag = -1;
	private startedConnectingExisting = false;

	public ctx!: CanvasRenderingContext2D;
	private animationRef = 0;
	private resizeObserver?: ResizeObserver;

	private drawer = inject(CanvasDraw);

	ngAfterViewInit() {
		const canvas = this.canvasRef().nativeElement;

		this.updateCanvasSize(canvas);

		this.resizeObserver = new ResizeObserver(() => this.updateCanvasSize(canvas));
		this.resizeObserver.observe(canvas.parentElement!);

		if (!this.globals.data.loadLast()) {
			this.globals.simulation.circuitComponents().push(new LED(this.globals, true, 10, 0));
			this.globals.simulation.circuitComponents().push(new Switch(this.globals, true, -30, 0));

			//this.globals.view().z = 1;
			//setTimeout(() => this.targetZ.set(2), 50);
		}

		canvas.focus();

		if (localStorage.getItem('tutorial') !== 'true') this.globals.tutorial.open();

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
			const dt = now - last;
			this.globals.frame.update((v) => ({...v, dt, fps: dt > 0 ? 1000 / dt : 0}));
			last = now;

			const v = this.globals.view();
			const nextZ = v.z + (this.targetZ() - v.z) * 0.15;
			if (Math.abs(nextZ - v.z) > 0.0001) {
				this.globals.view.update((prev) => ({...prev, z: nextZ}));
			}

			if (this.globals.simulation.running()) {
				this.globals.simulation.simulate();
			}
			this.draw(this.ctx);
			this.globals.canvasCursor = this.globals.canvasCursorCandidate;

			this.animationRef = requestAnimationFrame(tick);
			//canvas.focus(); // <- TODO safe?
		};

		this.animationRef = requestAnimationFrame(tick);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const view = this.globals.view();
		const {w, h, dpr} = view;
		const components = this.globals.simulation.circuitComponents();

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		this.drawer.drawGrid(ctx);
		this.drawer.drawWorld(ctx, this.globals.simulation);
		this.drawer.drawDebug(ctx);

		if (this.isConnecting()) {
			const pos1 = this.connectingToOrFrom();
			const cursor = this.globals.cursor();
			ctx.save();
			if (pos1.type == 'in') {
				drawWire(ctx, view,
					{x: cursor.x, y: cursor.y},
					{
						x: components[pos1.component].x + components[pos1.component].ins[pos1.index].x,
						y: components[pos1.component].y + components[pos1.component].ins[pos1.index].y
					},
					false,
					false
				);
			} else {
				drawWire(ctx, view,
					{
						x: components[pos1.component].x + components[pos1.component].outs[pos1.index].x,
						y: components[pos1.component].y + components[pos1.component].outs[pos1.index].y
					},
					{x: cursor.x, y: cursor.y},
					false,
					false
				);
			}
			ctx.restore();
		}
	}

	// CONTEXT MENU

	openContextMenu(event: MouseEvent) {
		event.preventDefault();
		if (this.globals.simulation.running()) return;

	}

	// MOVEMENT AND ZOOM (DESKTOP)

	onWheel(event: WheelEvent) {
		event.preventDefault();
		const v = this.globals.view();
		const rawFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
		const nextZ = this.clamp(v.z * rawFactor, 0.2, 10) / v.z;

		this.targetZ.update((z) => this.clamp(z * nextZ, 0.2, 10));
	}

	onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		if (event.pointerType === 'touch' && this.globals.isPanning()) return;

		this.selectedBeforeDrag = this.globals.selected;
		this.globals.isPanning.set(true);
		this.lastPointer.set({x: event.clientX, y: event.clientY});
		(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);

		if (this.globals.simulation.running()) {
			for (const component of this.globals.simulation.circuitComponents()) {
				if (component.mouseOverComponent()) component.pointerDownInSimulation();
			}
		} else {
			this.globals.selected = -1;
			for (const component of this.globals.simulation.circuitComponents()) {
				if (component.mouseOverComponent()) {
					this.globals.selected = component.id;
					break;
				}
			}

			for (const component of this.globals.simulation.circuitComponents()) {
				const ans = component.mouseOverPin();
				if (ans.index != -1) { // if is over pin
					this.isConnecting.set(true);
					this.globals.isPanning.set(false);

					if (ans.type == 'out') {
						this.connectingToOrFrom.set({component: component.id, type: 'out', index: ans.index});
						this.startedConnectingExisting = true;
					} else if (ans.type == 'in') {
						if (component.inFrom[ans.index].component == -1) { // not already connected
							this.connectingToOrFrom.set({component: component.id, type: 'in', index: ans.index});
						} else { // connected -> move, but from out
							const from = component.inFrom[ans.index];
							this.connectingToOrFrom.set({component: from.component, type: 'out', index: from.pin});

							this.globals.simulation.circuitComponents()[from.component].outTo[from.pin] = this.globals.simulation.circuitComponents()[from.component].outTo[from.pin].filter(c => c.component !== component.id || c.pin !== ans.index);
							component.inFrom[ans.index] = {component: -1, pin: -1};
							this.startedConnectingExisting = true;
						}
					}
					break;
				}
			}
		}
	}

	onPointerUp(event: PointerEvent) {
		this.globals.isPanning.set(false);

		if (this.globals.isDragging()) {
			const selectedComponent = this.globals.simulation.circuitComponents()[this.globals.selected];
			if (!selectedComponent) {
				this.globals.selected = -1;
				this.globals.isDragging.set(false);
				return;
			}

			selectedComponent.updatePos(0, 0, this.isSnapEnabled());
			selectedComponent.x = Math.round(selectedComponent.x * 100) / 100;
			selectedComponent.y = Math.round(selectedComponent.y * 100) / 100;
			this.globals.isDragging.set(false);
			this.globals.simulation.saveState();
		}

		(event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
		const click = this.moved_amt <= 5;
		if (!click && this.selectedBeforeDrag !== this.globals.selected) {
			this.globals.selected = -1;
		}
		this.selectedBeforeDrag = -1;
		this.moved_amt = 0;

		if (this.globals.simulation.running()) {
			for (const component of this.globals.simulation.circuitComponents()) {
				component.pointerUpInSimulation();
			}

			if (click) {
				for (const component of this.globals.simulation.circuitComponents())
					if (component.mouseOverComponent()) component.clickInSimulation();
			}
		} else if (this.isConnecting()) {
			this.isConnecting.set(false);

			for (const component of this.globals.simulation.circuitComponents()) {
				const ans = component.mouseOverPin();
				if (ans.index != -1) {
					const to = {component: component.id, type: ans.type, index: ans.index};
					const from = this.connectingToOrFrom();

					if (to.component === from.component) {
						if ((from.type === 'in' && to.type === 'out') || (from.type === 'out' && to.type === 'in'))
							_Toast.warning('Connecting in to out of the same component is... not allowed? idk or implementation defined imma let you for now');
						// break;
					}

					if (from.type === 'out' && to.type === 'in') {
						if (component.inFrom[to.index].component != -1) {
							this.globals.simulation.circuitComponents()[component.inFrom[to.index].component].outTo[component.inFrom[to.index].pin] = this.globals.simulation.circuitComponents()[component.inFrom[to.index].component].outTo[component.inFrom[to.index].pin].filter(c => c.component !== to.component || c.pin !== to.index);
							component.inFrom[to.index] = {component: -1, pin: -1};
						}
						this.globals.simulation.circuitComponents()[to.component].inFrom[to.index] = {component: from.component, pin: from.index};
						if (!this.globals.simulation.circuitComponents()[from.component].outTo[from.index])
							this.globals.simulation.circuitComponents()[from.component].outTo[from.index] = [];
						this.globals.simulation.circuitComponents()[from.component].outTo[from.index].push({component: to.component, pin: to.index});

						this.globals.simulation.saveState();
					} else if (from.type === 'in' && to.type === 'out') {
						this.globals.simulation.circuitComponents()[from.component].inFrom[from.index] = {component: to.component, pin: to.index};
						if (!this.globals.simulation.circuitComponents()[to.component].outTo[to.index])
							this.globals.simulation.circuitComponents()[to.component].outTo[to.index] = [];
						this.globals.simulation.circuitComponents()[to.component].outTo[to.index].push({component: from.component, pin: from.index});

						this.globals.simulation.saveState();
					} else _Toast.warning('You can only connect an output pin to an input pin and vice versa.');
					break;
				} else if (this.startedConnectingExisting) {
					this.globals.simulation.saveState();
					this.startedConnectingExisting = false;
				}
			}

			this.startedConnectingExisting = false;
		}
	}

	onPointerMove(event: PointerEvent) {
		const rect = this.canvasRef().nativeElement.getBoundingClientRect();
		const components = this.globals.simulation.circuitComponents();
		const view = this.globals.view();

		if (this.globals.isPanning() && !this.isConnecting()) {
			const last = this.lastPointer();
			if (event.clientX !== last.x || event.clientY !== last.y) this.moved_amt++;
			const z = view.z;

			if (this.globals.selected != -1) {
				if (!this.globals.isDragging()) this.globals.isDragging.set(true);
				const selectedComponent = components[this.globals.selected];
				if (!selectedComponent) {
					this.globals.selected = -1;
					this.globals.isDragging.set(false);
					return;
				}

				selectedComponent.updatePos((event.clientX - last.x) / z, -(event.clientY - last.y) / z, this.isSnapEnabled());
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
		const nextView = this.globals.view();

		this.globals.cursor.update(() => ({
			x: (mouseX - nextView.w / 2) / nextView.z - nextView.x,
			y: -(mouseY - nextView.h / 2) / nextView.z + nextView.y
		}));

		// SETTING CURSOR
		let candidate = 'default';
		for (const component of components) {
			if (component.mouseOverComponent()) {
				candidate = 'pointer';
				break;
			}
		}

		if (!this.globals.simulation.running()) for (const component of components) {
			if (component.mouseOverPin().index != -1) {
				candidate = 'crosshair';
				break;
			}
		}

		this.globals.canvasCursorCandidate = candidate;
	}


	// KEYBOARD

	onKeyDown(event: KeyboardEvent) {
		if (event.key == 'Delete') {
			if (this.globals.selected === -1) return;

			const selectedId = this.globals.selected;
			const components = this.globals.simulation.circuitComponents();
			const selectedComponent = components.find(c => c.id === selectedId);

			_Toast.warning(selectedComponent!.name + ' deleted.');

			if (!selectedComponent) return; // for safety

			selectedComponent.disconnect();
			selectedComponent.deleted = true;
			this.globals.selected = -1;
		}

		if (event.key == ' ') {
			this.globals.simulation.switch();
		}

		if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
			//this.globals.data.load();
			this.globals.simulation.undo();
		}

		if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
			this.globals.simulation.redo();
		}

		if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			this.globals.data.saveLast();
		}
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

		this.globals.simulation.spawnComponent(componentName, worldX, worldY, true);
	}


	// MISC AND HELPERS

	private updateCanvasSize(canvas: HTMLCanvasElement) {
		const host = canvas.parentElement ?? canvas;
		const rect = host.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;

		const dpr = window.devicePixelRatio || 1;
		const width = Math.max(1, Math.floor(rect.width * dpr));
		const height = Math.max(1, Math.floor(rect.height * dpr));
		const currentView = this.globals.view();

		if (currentView.w === rect.width && currentView.h === rect.height && currentView.dpr === dpr && canvas.width === width && canvas.height === height) {
			return;
		}

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

	private isSnapEnabled(): boolean {
		return localStorage.getItem('snap') === 'true';
	}
}
