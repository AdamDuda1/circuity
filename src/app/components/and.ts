import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class AND extends ElectricalComponent {
    constructor(public override globals: Globals, giveID: boolean, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        if (giveID) this.id = this.globals.getNextID();
        else this.id = -1;

        this.category = this.globals.constants.categoryName.basicLogicGates;
    }

    id;
    category;
    name = 'AND';

    type = '';

    color = 'red';

    x = 0;
    y = 0;
    h = 20;
    w = 20;

    actualSize;
    ins = [{x: -3, y: 4}, {x: -3, y: 16}];
    outs = [{x: 22.5, y: 10}];

    override condition() {
        this.outStates[0] = this.inStates[0] && this.inStates[1];
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
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * z;
        ctx.beginPath();
        ctx.moveTo(x + w * .05, y);
        ctx.lineTo(x + w * .05, y + h);
        ctx.lineTo(x + w / 2, y + h);

        ctx.arc(
            x + w / 2,
            y + h / 2,
            h / 2,
            Math.PI / 2,
            -Math.PI / 2,
            true
        );

        ctx.lineTo(x + w * .05, y);

        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.3 * z;
        ctx.stroke();

        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w * .05 - .65 * z, y);
        ctx.moveTo(x + w, y + h / 2);
        ctx.lineTo(x + w + 3 * z, y + h / 2);
        ctx.moveTo(x + w * .05, y + h / 5);
        ctx.lineTo(x - 3 * z, y + h / 5);
        ctx.moveTo(x + w * .05, y + h / 5 * 4);
        ctx.lineTo(x - 3 * z, y + h / 5 * 4);
        ctx.stroke();

        ctx.restore();
    }
}
