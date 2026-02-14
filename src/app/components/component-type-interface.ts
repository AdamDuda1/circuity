import { Globals } from '../globals';
import { drawWire } from './wire';

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

    inFrom: { component: number, pin: number }[] = [];
    outTo: { component: number, pin: number }[] = [];
    //outTo = signal<{ component: number, pin: number }[][]>([[]]); TODO multiple outs

    inStates: boolean[] = [];
    outStates: boolean[] = [];

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
        if (this.globals.debug) this.drawPinDots(ctx);
        this.drawShape(ctx, view, properties);

        for (const out of this.outTo) {
            const target = this.globals.simulation.circuitComponents()[out.component];
            if (!target) continue;

            const fromPin = this.outs[this.outTo.indexOf(out)];
            const toPin = target.ins[out.pin];

            drawWire(ctx, this.globals.view(), {x: this.x + fromPin.x, y: this.y + fromPin.y}, {x: target.x + toPin.x, y: target.y + toPin.y});
        }
    }

    abstract drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any): void;

    drawPinDots(ctx: CanvasRenderingContext2D) {
        const view = this.globals.view();
        ctx.save();

        const screenSize = 2 * this.globals.view().z;

        ctx.lineWidth = 0;
        ctx.fillStyle = 'orange';
        for (const pin of this.ins) {
            const screenX = (this.x + pin.x + view.x) * view.z + view.w / 2;
            const screenY = (-(this.y + pin.y) + view.y) * view.z + view.h / 2;
            ctx.fillRect(screenX - screenSize / 2, screenY - screenSize / 2, screenSize, screenSize);
        }

        ctx.lineWidth = 0;
        ctx.fillStyle = 'purple';
        for (const pin of this.outs) {
            const screenX = (this.x + pin.x + view.x) * view.z + view.w / 2;
            const screenY = (-(this.y + pin.y) + view.y) * view.z + view.h / 2;
            ctx.fillRect(screenX - screenSize / 2, screenY - screenSize / 2, screenSize, screenSize);
        }
        ctx.restore();
    }

    drawSelectionIndicator(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }) {
        if (!this.isSelected()) return;

        const viewW = view?.w ?? this.globals.view().w;
        const viewH = view?.h ?? this.globals.view().h;

        const z = view?.z ?? 1;
        const x = view?.x ?? 0;
        const y = view?.y ?? 0;

        const screenX = (this.x + x) * z + viewW / 2;
        const screenY = (-this.y + y) * z + viewH / 2;

        const w = this.w * z;
        const h = this.h * z;

        ctx.save();
        ctx.shadowColor = 'rgba(255,165,0,1)';
        ctx.shadowBlur = 5 * z;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.lineWidth = 4 * z;
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(screenX + w / 2, screenY - h / 2, z, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.restore();
    }

    mouseOverComponent(): boolean {
        return (this.globals.cursor().x >= this.x && this.globals.cursor().x <= this.x + this.w &&
            this.globals.cursor().y >= this.y && this.globals.cursor().y <= this.y + this.h);
    }

    mouseOverPin(): { index: number, type: 'in' | 'out' } {
        const zone = 2;

        for (let i = 0; i < this.ins.length; ++i) {
            if (this.globals.cursor().x >= this.x + this.ins[i].x - zone && this.globals.cursor().x <= this.x + this.ins[i].x + zone &&
                this.globals.cursor().y >= this.y + this.ins[i].y - zone && this.globals.cursor().y <= this.y + this.ins[i].y + zone) return {index: i, type: 'in'};
        }

        for (let i = 0; i < this.outs.length; ++i) {
            if (this.globals.cursor().x >= this.x + this.outs[i].x - zone && this.globals.cursor().x <= this.x + this.outs[i].x + zone &&
                this.globals.cursor().y >= this.y + this.outs[i].y - zone && this.globals.cursor().y <= this.y + this.outs[i].y + zone) return {index: i, type: 'out'};
        }

        return {index: -1, type: 'in'};
    }
}