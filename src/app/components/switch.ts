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
    }

    id;
    name = 'Switch';
    category = 'sources';

    type = '';

    isOn = false;

    get color() {
        return this.isOn ? 'lime' : 'gray';
    }

    x = 0;
    y = 0;
    h = 20;
    w = 30;

    actualSize;
    ins: { x: number; y: number }[] = [];
    outs = [{x: 32.5, y: 10}];

    toggle() {
        this.isOn = !this.isOn;
    }

    drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any) {
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

        // Draw switch body
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.3 * z;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 3 * z);
        ctx.fill();
        ctx.stroke();

        // Draw switch lever
        const leverWidth = w * 0.4;
        const leverHeight = h * 0.6;
        const leverY = y + h * 0.2;
        const leverX = this.isOn ? x + w * 0.5 : x + w * 0.1;

        ctx.fillStyle = this.isOn ? 'white' : 'darkgray';
        ctx.beginPath();
        ctx.roundRect(leverX, leverY, leverWidth, leverHeight, 2 * z);
        ctx.fill();
        ctx.stroke();

        // Draw output wire
        ctx.beginPath();
        ctx.moveTo(x + w, y + h / 2);
        ctx.lineTo(x + w + 3 * z, y + h / 2);
        ctx.stroke();

        ctx.restore();
    }
}
