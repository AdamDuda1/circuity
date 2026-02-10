import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class OR extends ElectricalComponent {
    constructor(public override globals: Globals, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        this.id = this.globals.simulation.circuitComponents.length;
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
        ctx.lineWidth = 1.4 * view.z;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = this.color;

        ctx.moveTo(x - 3 * view.z, y + h * 0.3);
        ctx.lineTo(x + w * 0.5, y + h * 0.3);
        ctx.moveTo(x - 3 * view.z, y + h * 0.7);
        ctx.lineTo(x + w * 0.5, y + h * 0.7);
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.quadraticCurveTo(
            x + w * .25,
            y + h * 0.25,
            x + w * .25,
            y + h / 2
        );

        ctx.quadraticCurveTo(
            x + w * .25,
            y + h * 0.75,
            x,
            y + h
        );

        ctx.bezierCurveTo(
            x + w * 0.6,
            y + h,
            x + w * 0.9,
            y + h * 0.75,
            x + w,
            y + h / 2
        );

        ctx.bezierCurveTo(
            x + w * 0.9,
            y + h * 0.25,
            x + w * 0.6,
            y,
            x + w * 0.25,
            y
        );

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(x + w, y + h / 2);
        ctx.lineTo(x + w + 3 * view.z, y + h / 2);
        ctx.stroke();
        ctx.restore();
    }
}
