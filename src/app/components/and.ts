import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class AND extends ElectricalComponent {
    constructor(public override globals: Globals, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        this.id = this.globals.simulation.circuitComponents.length;
    }

    id;
    name = 'AND';
    category = 'basic-gates';

    type = '';

    color = 'red';

    x = 0;
    y = 0;
    h = 20;
    w = 20;

    actualSize;
    ins = [];
    outs = [];

    render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, w?: number, h?: number, properties?: any) {
        const screenX = (this.x + view.x) * view.z + view.w / 2;
        const screenY = (-this.y + view.y) * view.z + view.h / 2;
        w = w ?? this.w * view.z;
        h = h ?? this.h * view.z;

        const x = screenX;
        const y = screenY - h;

        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * view.z;
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
        ctx.lineWidth = 1.3 * view.z;
        ctx.stroke();

        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w * .05 - .65 * view.z, y);
        ctx.moveTo(x + w, y + h / 2);
        ctx.lineTo(x + w + 3 * view.z, y + h / 2);
        ctx.moveTo(x + w * .05, y + h / 5);
        ctx.lineTo(x - 3 * view.z, y + h / 5);
        ctx.moveTo(x + w * .05, y + h / 5 * 4);
        ctx.lineTo(x - 3 * view.z, y + h / 5 * 4);
        ctx.stroke();

        ctx.font = `${8 * view.z}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(this.id), x + w /2, y + h /2);

        ctx.restore();
    }
}
