import { Globals } from '../globals';
import { drawWire } from './wire';

export interface SerializedPinRef {
	component: number;
	pin: number;
}

export interface SerializedElectricalComponent {
	name: string;
	color?: string;
	description?: string;
	truthTable?: string;
	gif?: string;
	x: number;
	y: number;
	showLabel?: boolean;
	inFrom?: SerializedPinRef[];
	outTo?: SerializedPinRef[][];
	custom?: Record<string, unknown>;
}

export abstract class ElectricalComponent {
	protected constructor(protected readonly globals: Globals) {}

	private snapRawX: number | null = null;
	private snapRawY: number | null = null;

	abstract id: number;
	abstract name: string;
	abstract category: string;
	abstract type: string;
	abstract color: string;
	abstract x: number;
	abstract y: number;
	abstract w: number;
	abstract h: number;

	description = '';
	truthTable = '';
	gif = '';

	showLabel: boolean = false;

	deleted = false;

	abstract actualSize: { x1: number, y1: number, w: number, h: number };
	abstract ins: { x: number, y: number } [];
	abstract outs: { x: number, y: number } [];

	abstract noOfIns: number;
	abstract noOfOuts: number;
	noOutConnections: number[] = [];

	inFrom: { component: number, pin: number }[] = [{component: -1, pin: -1}, {component: -1, pin: -1}]; // set all
	// to -1 in the beginning!!
	outTo: { component: number, pin: number }[][] = [
		[{component: -1, pin: -1}, {component: -1, pin: -1}, {component: -1, pin: -1}, {component: -1, pin: -1}],
		[{component: -1, pin: -1}, {component: -1, pin: -1}, {component: -1, pin: -1}, {component: -1, pin: -1}]
	]; // TODO multiple outs
	//outTo = signal<{ component: number, pin: number }[][]>([[]]); TODO multiple outs

	inStates: boolean[] = [];
	outStates: boolean[] = [];

	hoveredOverPin: { index: number, type: 'in' | 'out' } = {index: -1, type: 'in'};

	spawnComponentFromJSON(data: SerializedElectricalComponent) {
		this.x = data.x;
		this.y = data.y;
		this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
		if (typeof data.showLabel === 'boolean') {
			this.showLabel = data.showLabel;
		}
		this.description = data.description ?? this.description;
		this.truthTable = data.truthTable ?? this.truthTable;
		this.gif = data.gif ?? this.gif;

		if (this.canSetColor() && data.color !== undefined) {
			this.color = data.color;
		}

		if (data.inFrom) {
			this.inFrom = data.inFrom.map((item) => ({...item}));
		}

		if (data.outTo) {
			this.outTo = data.outTo.map((arr) => arr.map((item) => ({...item})));
		}
		this.applyCustomPropsFromJSON(data.custom);
	}

	getComponentJSON(): SerializedElectricalComponent {
		const custom = this.getCustomPropsJSON();

		return {
			name: this.name,
			color: this.color,
			description: this.description,
			truthTable: this.truthTable,
			gif: this.gif,
			x: this.x,
			y: this.y,
			showLabel: this.showLabel,
			inFrom: this.inFrom.map((item) => ({...item})),
			outTo: this.outTo.map((arr) => arr.map((item) => ({...item}))),
			...(custom ? {custom} : {})
		};
	}

	protected getCustomPropsJSON(): Record<string, unknown> | undefined {
		return undefined;
	}

	protected applyCustomPropsFromJSON(_custom?: Record<string, unknown>) {}

	private canSetColor(): boolean {
		const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'color');
		if (!descriptor) return true;
		if (descriptor.set) return true;
		return !descriptor.get;
	}

	clickInSimulation() {}

	pointerDownInSimulation() {}

	pointerUpInSimulation() {}

	condition() {}

	setPinDefaults() { // TODO!!!
		const d = {component: -1, pin: -1};

		for (let i = 0; i < this.noOfIns; i++) {
			this.inFrom[i] = d;
			this.inStates[i] = false;
		}

		for (let i = 0; i < this.noOfOuts; i++) {
			this.outTo[i] = [];
			this.outStates[i] = false;
			this.noOutConnections[i] = 0;
		}
	}

	simulate() {
		if (this.deleted) return;
		for (let i = 0; i < this.ins.length; i++) {
			const connection = this.inFrom[i];
			if (connection && connection.component !== -1) {
				const sourceComponent = this.globals.simulation.circuitComponents()[connection.component];
				if (sourceComponent && sourceComponent.outStates[connection.pin] !== undefined) {
					this.inStates[i] = sourceComponent.outStates[connection.pin];
				} else {
					this.inStates[i] = false;
				}
			} else {
				this.inStates[i] = false;
			}
		}
		this.condition();
	}

	updatePos(x: number, y: number, snap?: boolean) {
		if (snap) {
			if (this.snapRawX === null || this.snapRawY === null) {
				this.snapRawX = this.x;
				this.snapRawY = this.y;
			}

			this.snapRawX += x;
			this.snapRawY += y;

			const viewScale = this.globals.view().z;
			const snapStep = Math.pow(5, Math.floor(Math.log10(500 / viewScale)));

			const centerX = this.snapRawX + this.w / 2;
			const centerY = this.snapRawY + this.h / 2;

			const snappedCenterX = Math.round((centerX) / snapStep) * snapStep;
			const snappedCenterY = Math.round((centerY) / snapStep) * snapStep;

			this.x = snappedCenterX - this.w / 2;
			this.y = snappedCenterY - this.h / 2;
		} else {
			this.x += x;
			this.y += y;
			this.snapRawX = this.x;
			this.snapRawY = this.y;
		}

		this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
	}

	setSize(w: number, h: number) {
		this.w = w;
		this.h = h;
	}

	isSelected(): boolean {
		return this.id !== -1 && this.globals.isSelected(this.id);
	}

	render(ctx: CanvasRenderingContext2D, view?: {
		x: number,
		y: number,
		z: number,
		w?: number,
		h?: number
	}, properties?: any) {
		if (!ctx || this.deleted) return;
		if (!view) {
			const defaultView = this.globals.view();
			view = {...defaultView, w: undefined, h: undefined};
		}

		this.drawPinDots(ctx);

		this.drawSelectionIndicator(ctx, view);
		this.drawShape(ctx, view, properties);
		if (this.isSelected()) ctx.restore();

		ctx.save();
		for (let outIndex = 0; outIndex < this.outTo.length; outIndex++) {
			const connections = this.outTo[outIndex];
			if (!connections) continue;

			for (const connection of connections) {
				const targetComponent = this.globals.simulation.circuitComponents()[connection.component];
				if (!targetComponent || !targetComponent.ins[connection.pin]) continue;

				const fromPin = this.outs[outIndex];
				const toPin = targetComponent.ins[connection.pin];

				drawWire(ctx, this.globals.view(),
					{x: this.x + fromPin.x, y: this.y + fromPin.y},
					{x: targetComponent.x + toPin.x, y: targetComponent.y + toPin.y},
					this.globals.simulation.running() && this.globals.indicationOnWires,
					this.outStates[outIndex]
				);
			}
		}
		ctx.restore();

		this.drawLabel(ctx);
	}

	abstract drawShape(ctx: CanvasRenderingContext2D, view?: {
		x: number,
		y: number,
		z: number,
		w?: number,
		h?: number
	}, properties?: any): void;

	drawPinDots(ctx: CanvasRenderingContext2D) {
		const view = this.globals.view();

		ctx.lineWidth = 0.1 * view.z;
		ctx.strokeStyle = 'black';

		for (let i = 0; i < this.ins.length; i++) {
			const _in = this.ins[i];
			if (this.inFrom[i] && this.inFrom[i].component !== -1) {
				const screenX = (this.x + _in.x + view.x) * view.z + view.w / 2;
				const screenY = (-(this.y + _in.y) + view.y) * view.z + view.h / 2;

				ctx.save();
				ctx.fillStyle = 'black';
				ctx.beginPath();
				ctx.arc(screenX, screenY, 1.1 * view.z, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}

			if (this.hoveredOverPin.index === i && this.hoveredOverPin.type === 'in') {
				const screenX = (this.x + _in.x + view.x) * view.z + view.w / 2;
				const screenY = (-(this.y + _in.y) + view.y) * view.z + view.h / 2;

				ctx.save();
				ctx.beginPath();
				ctx.fillStyle = '#e3fe2257';
				ctx.lineWidth = 2 * view.z;
				ctx.fillRect(screenX - 3 * view.z, screenY - 3 * view.z, 6 * view.z, 6 * view.z);
				ctx.restore();
			}
		}

		for (let i = 0; i < this.outs.length; i++) {
			const _out = this.outs[i];
			if (this.outTo[i] && this.outTo[i].length > 0 && this.outTo[i].some(conn => conn.component !== -1)) {
				const screenX = (this.x + _out.x + view.x) * view.z + view.w / 2;
				const screenY = (-(this.y + _out.y) + view.y) * view.z + view.h / 2;

				ctx.save();
				ctx.fillStyle = 'black';
				ctx.beginPath();
				ctx.arc(screenX, screenY, 1.1 * view.z, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}

			if (this.hoveredOverPin.index === i && this.hoveredOverPin.type === 'out') {
				const screenX = (this.x + _out.x + view.x) * view.z + view.w / 2;
				const screenY = (-(this.y + _out.y) + view.y) * view.z + view.h / 2;

				ctx.save();
				ctx.beginPath();
				ctx.fillStyle = '#e3fe2257';
				ctx.lineWidth = 2 * view.z;
				ctx.fillRect(screenX - 3 * view.z, screenY - 3 * view.z, 6 * view.z, 6 * view.z);
				ctx.restore();
			}
		}
	}

	drawLabel(ctx: CanvasRenderingContext2D) {
		if (!this.name) return;

		const normalizedName = this.name.trim().toLowerCase();
		const isUsedIO = this.globals.playUsedIO().some((entry) => entry.trim().toLowerCase() === normalizedName);
		if (!this.showLabel && !isUsedIO) return;

		const view = this.globals.view();

		ctx.save();
		ctx.fillStyle = isUsedIO ? '#8b5cf6' : 'black';
		ctx.font = `${12 * view.z}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const screenX = (this.x + this.w / 2 + view.x) * view.z + view.w / 2;
		const screenY = (-(this.y - this.h / 2) + view.y) * view.z + view.h / 2;
		ctx.fillText(this.name, screenX, screenY);
		ctx.restore();
	}

	drawSelectionIndicator(ctx: CanvasRenderingContext2D, view?: {
		x: number,
		y: number,
		z: number,
		w?: number,
		h?: number
	}) {
		if (!this.isSelected()) return;

		const viewW = view?.w ?? this.globals.view().w;
		const viewH = view?.h ?? this.globals.view().h;

		const z = view?.z ?? 1;
		const x = view?.x ?? 0;
		const y = view?.y ?? 0;

		const screenX = (this.x + x) * z + viewW / 2;
		const screenY = (-this.y + y) * z + viewH / 2;

		const w = this.w * z;
		const h = this.h * z;

		ctx.save();
		ctx.shadowBlur = 20 * z;
		ctx.shadowColor = this.color;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.beginPath();
		ctx.arc(screenX + w / 2, screenY - h / 2, z * 10, 0, Math.PI * 2);
	}

	mouseOverComponent(): boolean {
		return (this.globals.cursor().x >= this.x && this.globals.cursor().x <= this.x + this.w &&
			this.globals.cursor().y >= this.y && this.globals.cursor().y <= this.y + this.h);
	}

	mouseOverPin(): { index: number, type: 'in' | 'out' } {
		const zone = this.globals.constants.pinSelectionZone;

		for (let i = 0; i < this.ins.length; ++i) {
			if (this.globals.cursor().x >= this.x + this.ins[i].x - zone && this.globals.cursor().x <= this.x + this.ins[i].x + zone &&
				this.globals.cursor().y >= this.y + this.ins[i].y - zone && this.globals.cursor().y <= this.y + this.ins[i].y + zone) {
				this.hoveredOverPin = {index: i, type: 'in'};
				return {index: i, type: 'in'};
			}
		}

		for (let i = 0; i < this.outs.length; ++i) {
			if (this.globals.cursor().x >= this.x + this.outs[i].x - zone && this.globals.cursor().x <= this.x + this.outs[i].x + zone &&
				this.globals.cursor().y >= this.y + this.outs[i].y - zone && this.globals.cursor().y <= this.y + this.outs[i].y + zone) {
				this.hoveredOverPin = {index: i, type: 'out'};
				return {index: i, type: 'out'};
			}
		}

		this.hoveredOverPin = {index: -1, type: 'in'};
		return {index: -1, type: 'in'};
	}

	disconnect() {
		for (const [index, from] of this.inFrom.entries()) {
			if (from.component !== -1) {
				const sourceComponent = this.globals.simulation.circuitComponents().find(c => c.id === from.component);
				if (sourceComponent) {
					sourceComponent.outTo[from.pin] = sourceComponent.outTo[from.pin].filter(
						c => c.component !== this.id || c.pin !== index
					);
				}
			}
		}

		for (const out of this.outTo) {
			if (out) for (const to of out) {
				const targetComponent = this.globals.simulation.circuitComponents().find(c => c.id === to.component);
				if (targetComponent) {
					targetComponent.inFrom[to.pin] = {component: -1, pin: -1};
				}
			}

		}

		this.setPinDefaults();
	}
}
