import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class Buzzer extends ElectricalComponent {
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
	name = 'Buzzer';

	type = '';

	color = '#ff9f1a';
	public frequency = 440;
	public volume = 0.2;

	private audioCtx?: AudioContext;
	private osc?: OscillatorNode;
	private gainNode?: GainNode;
	private lastIsOn = false;

	x = 0;
	y = 0;
	h = 20;
	w = 20;

	noOfIns = 1;
	noOfOuts = 0;

	actualSize;
	ins = [{x: -1.5, y: 10}];
	outs = [];

	private updateAudio(isOn: boolean) {
		if (!this.audioCtx) {
			this.audioCtx = new AudioContext();
			this.gainNode = this.audioCtx.createGain();
			this.gainNode.connect(this.audioCtx.destination);
			this.gainNode.gain.value = 0;
			this.osc = this.audioCtx.createOscillator();
			this.osc.type = 'square';
			this.osc.frequency.value = this.frequency;
			this.osc.connect(this.gainNode);
			this.osc.start();
		} else if (this.osc) this.osc.frequency.value = this.frequency;

		if (this.audioCtx.state === 'suspended' && isOn) this.audioCtx.resume();

		this.gainNode?.gain.setTargetAtTime(isOn ? this.volume : 0, this.audioCtx.currentTime, 0.02);
	}

	public setVolume(vol: number) {
		this.volume = Math.max(0, Math.min(1, vol));
		if (this.gainNode && this.audioCtx) {
			const isOn = (this.inStates[0] ?? false) && this.globals.simulation.running();
			this.gainNode.gain.setTargetAtTime(isOn ? this.volume : 0, this.audioCtx.currentTime, 0.02);
		}
	}

	protected override getCustomPropsJSON() {
		return { frequency: this.frequency, volume: this.volume };
	}

	protected override applyCustomPropsFromJSON(custom?: Record<string, unknown>) {
		if (!custom) return;
		const frequency = custom['frequency'], volume = custom['volume'];
		if (typeof frequency === 'number' && Number.isFinite(frequency) && frequency > 0) this.frequency = frequency;
		if (typeof volume === 'number' && Number.isFinite(volume)) this.setVolume(volume);
	}

	drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }) {
		const viewW = view?.w ?? this.globals.view().w;
		const viewH = view?.h ?? this.globals.view().h;

		const screenX = (this.x + (view?.x ?? 0)) * (view?.z ?? 1) + viewW / 2;
		const screenY = (-this.y + (view?.y ?? 0)) * (view?.z ?? 1) + viewH / 2;

		const w = this.w * (view?.z ?? 1);
		const h = this.h * (view?.z ?? 1);
		const z = view?.z ?? 1;

		const x = screenX;
		const y = screenY - h;

		const isOn = this.inStates[0] && this.globals.simulation.running();

		if (this.lastIsOn !== isOn) {
			this.lastIsOn = isOn;
			this.updateAudio(isOn);
		}

		const s = Math.min(w, h) / 20;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.moveTo(x + 3 * s, y + h / 2);
		ctx.lineTo(x - 1.5 * z, y + h / 2);
		ctx.stroke();

		ctx.save();
		const cx = x + w / 2;
		const cy = y + h / 2;

		ctx.translate(cx, cy);

		ctx.fillStyle = isOn ? this.color : '#d8d8d8';
		ctx.strokeStyle = '#222';
		ctx.lineWidth = 1.4 * z;
		ctx.lineJoin = 'round';

		ctx.save();
		ctx.rotate(Math.PI);
		ctx.beginPath();
		ctx.moveTo(-7 * s, -5 * s);
		ctx.moveTo(-1.5 * s, -5 * s);
		ctx.lineTo(3.5 * s, -5 * s);
		ctx.arc(3.5 * s, 0, 5 * s, -Math.PI / 2, Math.PI / 2);
		ctx.lineTo(-1.5 * s, 5 * s);
		ctx.closePath();

		if (isOn) {
			ctx.shadowColor = this.color;
			ctx.shadowBlur = 8 * z;
		}

		ctx.fill();
		ctx.shadowBlur = 0;
		ctx.stroke();
		ctx.restore();

		if (isOn) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 1.5 * z;
			ctx.lineCap = 'round';
			for (let i = 1; i <= 2; i++) {
				ctx.beginPath();
				ctx.arc(-2 * s, 0, 5 * s + i * 3 * s, -Math.PI / 3, Math.PI / 3);
				ctx.stroke();
			}
		}

		ctx.restore();
	}
}
