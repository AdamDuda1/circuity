import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class Clock extends ElectricalComponent {
	constructor(globals: Globals, giveID: boolean, _x: number, _y: number) {
		super(globals);
		this.x = _x;
		this.y = _y;
		this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
		if (giveID) this.id = this.globals.getNextID();
		else this.id = -1;

		this.category = this.globals.constants.categoryName.input;
	}

	id;
	category;
	name = 'Clock';
	override description = 'Periodic square-wave signal source.';
	override truthTable = 't | Q\n0 | 0\nT/2 | 1\nT | 0';
	override gif = '/component-previews/clock.gif';

	type = '';
	color = '#5865f2';

	x = 0;
	y = 0;
	h = 20;
	w = 24;

	noOfIns = 0;
	noOfOuts = 1;

	actualSize;
	ins: { x: number; y: number }[] = [];
	outs = [{x: this.w + 3, y: 10}];

	frequencyHz = 1;
	dutyCycle = 0.5;
	private phaseMs = 0;

	override condition() {
		const periodMs = this.getPeriodMs();
		if (!Number.isFinite(periodMs) || periodMs <= 0) {
			this.outStates[0] = false;
			return;
		}

		const dt = this.globals.frame().dt;
		if (Number.isFinite(dt) && dt > 0) {
			this.phaseMs = (this.phaseMs + dt) % periodMs;
		}

		this.outStates[0] = this.phaseMs < periodMs * this.dutyCycle;
	}

	override pointerDownInSimulation() {
		this.resetPhase();
	}

	setFrequencyHz(value: number) {
		if (!Number.isFinite(value)) return;
		this.frequencyHz = Math.min(100, Math.max(0.1, value));
	}

	setDutyCycle(value: number) {
		if (!Number.isFinite(value)) return;
		this.dutyCycle = Math.min(0.95, Math.max(0.05, value));
	}

	protected override getCustomPropsJSON() {
		return {
			frequencyHz: this.frequencyHz,
			dutyCycle: this.dutyCycle
		};
	}

	protected override applyCustomPropsFromJSON(custom?: Record<string, unknown>) {
		if (!custom) return;

		const frequencyHz = custom['frequencyHz'];
		const dutyCycle = custom['dutyCycle'];

		if (typeof frequencyHz === 'number') this.setFrequencyHz(frequencyHz);
		if (typeof dutyCycle === 'number') this.setDutyCycle(dutyCycle);
	}

	private resetPhase() {
		this.phaseMs = 0;
	}

	private getPeriodMs() {
		return this.frequencyHz > 0 ? 1000 / this.frequencyHz : Number.POSITIVE_INFINITY;
	}

	drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }) {
		const viewW = view?.w ?? this.globals.view().w;
		const viewH = view?.h ?? this.globals.view().h;

		const screenX = (this.x + (view?.x ?? 0)) * (view?.z ?? 1) + viewW / 2;
		const screenY = (-this.y + (view?.y ?? 0)) * (view?.z ?? 1) + viewH / 2;
		const z = view?.z ?? 1;
		const w = this.w * z;
		const h = this.h * z;
		const x = screenX;
		const y = screenY - h;

		ctx.save();

		ctx.fillStyle = this.outStates[0] ? '#2fbf53' : this.color;
		ctx.strokeStyle = '#111';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.roundRect(x, y + h * 0.1, w, h * 0.8, 3 * z);
		ctx.fill();
		ctx.stroke();

		const textX = x + w / 2;
		const textY = y + h / 2;
		const fontSize = Math.max(8, Math.round(Math.min(w, h) * 0.45));
		ctx.font = `${fontSize}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = 'rgba(0,0,0,0.45)';
		ctx.shadowBlur = 1 * z;
		ctx.fillStyle = 'white';
		ctx.fillText('555', textX, textY);
		ctx.shadowBlur = 0;
		ctx.shadowColor = 'transparent';

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.moveTo(x + w, y + h / 2);
		ctx.lineTo(x + w + 3 * z, y + h / 2);
		ctx.stroke();

		ctx.restore();
	}
}

