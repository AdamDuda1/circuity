import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class Switch extends ElectricalComponent {
	constructor(public override globals: Globals, giveID: boolean, _x: number, _y: number) {
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
	name = 'Switch';

	type = '';

	isOn = false;

	get color() {
		return this.isOn ? 'lime' : 'black'; // only for selection indicator (bg color is hardcoded)
	}

	x = 0;
	y = 0;
	h = 20;
	w = 20;

	noOfIns = 0;
	noOfOuts = 1;

	actualSize;
	ins: { x: number; y: number }[] = [];
	outs = [{x: this.w + 3, y: 10}];

	override condition() {
		this.outStates[0] = this.isOn;
	}

	override clickInSimulation() {
		this.toggle();
	}

	toggle() {
		this.isOn = !this.isOn;
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

		ctx.save();

		ctx.fillStyle = '#666';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.roundRect(x, y + h * 0.1, w, h * 0.8, 2 * z);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#333';
		ctx.beginPath();
		ctx.roundRect(x + w * 0.15, y + h * 0.35, w * 0.7, h * 0.3, z);
		ctx.fill();

		if (this.isOn) {
			ctx.fillStyle = '#2fbf53';
			ctx.fillRect(x + w * 0.15, y + h * 0.35, w * 0.5, h * 0.3);
		}

		const sliderWidth = w * 0.25;
		const sliderHeight = h * 0.6;

		const sliderX = this.isOn ? x + w * 0.6 : x + w * 0.15;
		const sliderY = y + h * 0.2;

		ctx.fillStyle = '#eee';
		ctx.strokeStyle = '#555';
		ctx.lineWidth = z;
		ctx.beginPath();
		ctx.roundRect(sliderX, sliderY, sliderWidth, sliderHeight, 2 * z);
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = '#aaa';
		ctx.beginPath();
		ctx.moveTo(sliderX + sliderWidth * 0.5, sliderY + sliderHeight * 0.2);
		ctx.lineTo(sliderX + sliderWidth * 0.5, sliderY + sliderHeight * 0.8);
		ctx.stroke();

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1.3 * z;
		ctx.beginPath();
		ctx.moveTo(x + w, y + h / 2);
		ctx.lineTo(x + w + 3 * z, y + h / 2);
		ctx.stroke();

		ctx.restore();
	}
}
