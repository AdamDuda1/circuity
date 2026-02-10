import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class NOT extends ElectricalComponent {
    constructor(public override globals: Globals, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        this.id = this.globals.simulation.circuitComponents.length;
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

        // NOT gate triangle
        ctx.beginPath();
        ctx.moveTo(x + w * .05, y);
        ctx.lineTo(x + w * .05, y + h);
        ctx.lineTo(x + w * .75, y + h / 2);
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.3 * view.z;
        ctx.stroke();

        // Inversion bubble
        ctx.beginPath();
        ctx.arc(
            x + w * .85,
            y + h / 2,
            h * .1,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();

        // Wires
        ctx.beginPath();
        ctx.moveTo(x + w * .05, y + h / 2);
        ctx.lineTo(x - 3 * view.z, y + h / 2);

        ctx.moveTo(x + w * .95, y + h / 2);
        ctx.lineTo(x + w + 3 * view.z, y + h / 2);
        ctx.stroke();

        ctx.restore();
    }

}
