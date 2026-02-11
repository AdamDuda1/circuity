import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class OR extends ElectricalComponent {
    constructor(public override globals: Globals, giveID: boolean, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        if (giveID) this.id = this.globals.getNextID();
        else this.id = -1;
    }

    id;
    name = 'OR';
    category = 'basic-gates';

    type = '';

    color = 'red';

    x = 0;
    y = 0;
    h = 20;
    w = 20;

    actualSize;
    ins = [{x: -3.5, y: 4.350}, {x: -3.5, y: 16.350}];
    outs = [{x: 23.5, y: 10.25}];

    drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any) {
        const viewW = view?.w ?? this.globals.view().w;
        const viewH = view?.h ?? this.globals.view().h;

        const z = view?.z ?? 1;
        const x = view?.x ?? 0;
        const y = view?.y ?? 0;

        const screenX = (this.x + x) * z + viewW / 2;
        const screenY = (-this.y + y) * z + viewH / 2;

        const w = this.w * z;
        const h = this.h * z;

        // if (this.globals.selected == this.id) this.color = 'blue';
        // else this.color = 'red';

        const posX = screenX;
        const posY = screenY - h;

        ctx.save();
        ctx.lineWidth = 1.4 * z;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = this.color;

        ctx.moveTo(posX - 3 * z, posY + h * 0.3);
        ctx.lineTo(posX + w * 0.5, posY + h * 0.3);
        ctx.moveTo(posX - 3 * z, posY + h * 0.7);
        ctx.lineTo(posX + w * 0.5, posY + h * 0.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(posX, posY);

        ctx.quadraticCurveTo(posX + w * .25, posY + h * 0.25, posX + w * .25, posY + h / 2);
        ctx.quadraticCurveTo(posX + w * .25, posY + h * 0.75, posX, posY + h);

        ctx.bezierCurveTo(posX + w * 0.6, posY + h, posX + w * 0.9, posY + h * 0.75, posX + w, posY + h / 2);
        ctx.bezierCurveTo(posX + w * 0.9, posY + h * 0.25, posX + w * 0.6, posY, posX + w * 0.25, posY);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(posX + w, posY + h / 2);
        ctx.lineTo(posX + w + 3 * z, posY + h / 2);
        ctx.stroke();

        ctx.restore();
    }
}
