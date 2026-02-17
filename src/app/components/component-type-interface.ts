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

    inFrom: { component: number, pin: number }[] = [{component: -1, pin: -1}, {component: -1, pin: -1}]; // set all to -1 in the beginning!!
    outTo: { component: number, pin: number }[][] = [[{component: -1, pin: -1}, {component: -1, pin: -1}], [{component: -1, pin: -1}, {component: -1, pin: -1}]]; // TODO multiple outs
    //outTo = signal<{ component: number, pin: number }[][]>([[]]); TODO multiple outs

    inStates: boolean[] = [];
    outStates: boolean[] = [];

    clickInSimulation() {
        console.log("clickInSimulation");
    } // override if needed

    //abstract simulate(): void;

    simulate() {

    }

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
        this.drawShape(ctx, view, properties);

        ctx.save();
        for (let outIndex = 0; outIndex < this.outTo.length; outIndex++) {
            const connections = this.outTo[outIndex];
            if (!connections) continue;

            for (const connection of connections) {
                const targetComponent = this.globals.simulation.circuitComponents()[connection.component];
                if (!targetComponent || !targetComponent.ins[connection.pin]) continue;

                const fromPin = this.outs[outIndex];
                const toPin = targetComponent.ins[connection.pin];

                drawWire(ctx, this.globals.view(),
                    {x: this.x + fromPin.x, y: this.y + fromPin.y},
                    {x: targetComponent.x + toPin.x, y: targetComponent.y + toPin.y}
                );
            }
        }
        ctx.restore();

        this.drawPinDots(ctx);
    }

    abstract drawShape(ctx: CanvasRenderingContext2D, view?: { x: number, y: number, z: number, w?: number, h?: number }, properties?: any): void;

    drawPinDots(ctx: CanvasRenderingContext2D) {
        const view = this.globals.view();

        ctx.lineWidth = 0.1 * view.z;
        ctx.strokeStyle = 'black';

        for (let i = 0; i < this.ins.length; i++) {
            const _in = this.ins[i];
            if (this.inFrom[i] && this.inFrom[i].component !== -1) {
                const screenX = (this.x + _in.x + view.x) * view.z + view.w / 2;
                const screenY = (-(this.y + _in.y) + view.y) * view.z + view.h / 2;

                ctx.save();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 1.1 * view.z, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < this.outs.length; i++) {
            const _out = this.outs[i];
            if (this.outTo[i] && this.outTo[i].length > 0) {
                const screenX = (this.x + _out.x + view.x) * view.z + view.w / 2;
                const screenY = (-(this.y + _out.y) + view.y) * view.z + view.h / 2;

                ctx.save();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 1.1 * view.z, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
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
        ctx.shadowBlur = 20 * z;
        ctx.shadowOffsetX = 5000 * z;
        ctx.shadowOffsetY = 5000 * z;
        ctx.beginPath();
        ctx.arc(screenX + w / 2 - 5000 * z, screenY - h / 2 - 5000 * z, z * 10, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        //ctx.shadowColor = 'blue'; // TODO pick selection color
        ctx.shadowColor = this.color;
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
