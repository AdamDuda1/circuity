import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class SignalReceiver extends ElectricalComponent {
	constructor(globals: Globals, giveID: boolean, _x: number, _y: number) {
		super(globals);
		this.x = _x;
		this.y = _y;
		this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
		if (giveID) this.id = this.globals.getNextID();
		else this.id = -1;

		this.category = this.globals.constants.categoryName.other;
	}

	id;
	category = 'other';
	name = 'Signal Receiver';
	override description = 'Outputs a signal if at least one signal sender is active on selected channel.';
	override gif = '/component-previews/signal.gif';
	type = '';

	color = '#32a852';
	channel = 1;

	x = 0;
	y = 0;
	h = 20;
	w = 24;

	noOfIns = 0;
	noOfOuts = 1;

	actualSize;
	ins = [];
	outs = [{x: this.w + 3, y: 10}];

	override condition() {
		this.outStates[0] = this.globals.simulation.readChannel(this.channel) && this.globals.simulation.running();
	}

	setChannel(channel: number) {
		if (!Number.isFinite(channel)) return;
		this.channel = Math.min(10, Math.max(1, Math.round(channel)));
	}

	protected override getCustomPropsJSON() {
		return {channel: this.channel};
	}

	protected override applyCustomPropsFromJSON(custom?: Record<string, unknown>) {
		if (!custom) return;
		const channel = custom['channel'];
		if (typeof channel === 'number') this.setChannel(channel);
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
		ctx.fillStyle = this.color;
		ctx.strokeStyle = '#222';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.roundRect(x, y + h * 0.15, w, h * 0.7, 3 * z);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(x + w, y + h / 2);
		ctx.lineTo(x + w + 3 * z, y + h / 2);
		ctx.stroke();

		ctx.fillStyle = 'white';
		const fontSize = Math.max(6, Math.round(h * 0.35));
		ctx.font = `${fontSize}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`RX${this.channel}`, x + w / 2, y + h / 2);
		ctx.restore();
	}
}

