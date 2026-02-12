import { Globals } from '../globals';

export abstract class ElectricalComponent {
    protected constructor(public globals: Globals) {}

    abstract id: number;
    abstract name: string;
    abstract category: string;
    abstract type: string;
    abstract color: string;
    abstract x: number;
    abstract y: number;
    abstract w: number;
    abstract h: number;

    abstract actualSize: { x1: number, y1: number, w: number, h: number };
    abstract ins: { x: number, y: number } [];
    abstract outs: { x: number, y: number } [];

    updatePos(x: number, y: number) {
        this.x += x;
        this.y += y;
        this.actualSize = {x1: this.x, y1: this.y, w: this.w, h: this.h};
    }

    setSize(w: number, h: number) {
        this.w = w;
        this.h = h;
    }

    isSelected(): boolean {
        return this.globals.selected === this.id && this.globals.selected != -1;
    }

    render(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any) {
        if (!ctx) return;
        if (!view) {
            const defaultView = this.globals.view();
            view = {...defaultView, w: undefined, h: undefined};
        }

        this.drawSelectionIndicator(ctx, view);
        this.drawPinDots(ctx);
        this.drawShape(ctx, view, properties);
    }

    abstract drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any): void;

    drawPinDots(ctx: CanvasRenderingContext2D) {
        const view = this.globals.view();
        ctx.save();

        ctx.lineWidth = 0;
        ctx.fillStyle = 'orange';
        for (const pin of this.ins) {
            const screenX = (this.x + pin.x + view.x) * view.z + view.w / 2;
            const screenY = (-(this.y + pin.y) + view.y) * view.z + view.h / 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 2 * view.z, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.lineWidth = 0;
        ctx.fillStyle = 'purple';
        for (const pin of this.outs) {
            const screenX = (this.x + pin.x + view.x) * view.z + view.w / 2;
            const screenY = (-(this.y + pin.y) + view.y) * view.z + view.h / 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 1.5 * view.z, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();
    }

    drawSelectionIndicator(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }) {
        if (!this.isSelected()) return;


    }

    mouseOverComponent(): boolean {
        return (this.globals.cursor().x >= this.x && this.globals.cursor().x <= this.x + this.w &&
            this.globals.cursor().y >= this.y && this.globals.cursor().y <= this.y + this.h);
    }
}