import { ElectricalComponent } from './component-type-interface';
import { Globals } from '../globals';

export class LED extends ElectricalComponent {
    constructor(public override globals: Globals, giveID: boolean, _x: number, _y: number) {
        super(globals);
        this.x = _x;
        this.y = _y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
        if (giveID) this.id = this.globals.getNextID();
        else this.id = -1;
    }

    id;
    name = 'LED';
    category = 'output';

    type = '';

    color = '#ff0000';

    x = 0;
    y = 0;
    h = 20;
    w = 20;

    actualSize;
    ins = [{x: -3, y: 10}];
    outs = [];

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

        const isOn = Boolean(this.inStates[0]);
        const ledColor = this.color;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.3 * z;
        ctx.beginPath();
        ctx.moveTo(x + 3 * z, y + h / 2);
        ctx.lineTo(x - 3 * z, y + h / 2);
        ctx.stroke();

        const withAlpha = (hex: string, alpha: number): string => {
            const raw = hex.startsWith('#') ? hex.slice(1) : hex;
            const base = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw;
            const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
            return `#${base}${a}`;
        };

        ctx.save();

        const cx = x + w / 2;
        const cy = y + h / 2;
        const radius = Math.min(w, h) * 0.35;

        ctx.fillStyle = '#222';
        ctx.beginPath();
        const baseSize = radius * 2.4;
        ctx.roundRect(cx - baseSize / 2, cy - baseSize / 2, baseSize, baseSize, 2 * z);
        ctx.fill();

        if (isOn) {
            const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.5);
            glow.addColorStop(0, withAlpha(ledColor, 0.8));
            glow.addColorStop(0.4, withAlpha(ledColor, 0.3));
            glow.addColorStop(1, withAlpha(ledColor, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const lensGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
        lensGrad.addColorStop(0, isOn ? withAlpha(ledColor, 1) : withAlpha(ledColor, 0.4));
        lensGrad.addColorStop(1, isOn ? withAlpha(ledColor, 0.8) : withAlpha(ledColor, 0.1));

        ctx.fillStyle = lensGrad;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = z;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isOn ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - radius * 0.3, cy - radius * 0.3, radius * 0.25, radius * 0.15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
