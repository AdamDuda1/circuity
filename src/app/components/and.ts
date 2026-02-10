import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class AND implements ElectricalComponent {
    constructor(public globals: Globals, _x: number, _y: number) {
        this.x = _x;
        this.y = _y;
    }

    name = 'AND';
    category = 'basic-gates';

    type = '';

    color = 'red';

    x = 0;
    y = 0;

    actualSize = {x1: 0, y1: 1, w: 21, h: 21};
    ins = [];
    outs = [];

    render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, w?: number, h?: number, properties?: any) {
        const screenX = (this.x + view.x) * view.z + view.w / 2;
        const screenY = (-this.y + view.y) * view.z + view.h / 2;
        w = w ?? 20 * view.z;
        h = h ?? 20 * view.z;

        // Render with component origin at bottom-left (Y goes up in world)
        const x = screenX;
        const y = screenY - h; // Shift up by height so bottom edge is at screenY

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

        ctx.restore();

        // Hit detection in world coordinates (Y goes up)
        const worldW = 20;
        const worldH = 20;
        const cursor = this.globals.cursor();

        if (cursor.x >= this.x && cursor.x <= this.x + worldW &&
            cursor.y >= this.y && cursor.y <= this.y + worldH) {
            this.globals.canvasCursorCandidate = 'pointer';
        }
    }
}
