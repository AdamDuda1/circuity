import { ElectronicalComponent } from './component-type-interface';

export class NOT implements ElectronicalComponent {
    constructor(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
    }

    name = 'NOT';
    type = '';

    color = 'red';

    x = 0;
    y = 0;

    render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number }, w?: number, h?: number, properties?: any) {
        let x = (this.x + view.x) * view.z;
        let y = (this.y + view.y) * view.z;
        w = w ?? 20 * view.z;
        h = h ?? 20 * view.z;

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
