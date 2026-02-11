import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class NOT extends ElectricalComponent {
    constructor(public override globals: Globals, giveID: boolean, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        if (giveID) this.id = this.globals.getNextID();
        else this.id = -1;
    }

    id;
    name = 'NOT';
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
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * z;

        ctx.beginPath();
        ctx.moveTo(posX + w * .05, posY);
        ctx.lineTo(posX + w * .05, posY + h);
        ctx.lineTo(posX + w * .75, posY + h / 2);
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.3 * z;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(posX + w * .85, posY + h / 2, h * .1, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(posX + w * .05, posY + h / 2);
        ctx.lineTo(posX - 3 * z, posY + h / 2);
        ctx.moveTo(posX + w * .95, posY + h / 2);
        ctx.lineTo(posX + w + 3 * z, posY + h / 2);
        ctx.stroke();

        ctx.restore();
    }

}
