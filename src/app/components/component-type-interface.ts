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

    abstract render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, w?: number, h?: number,
        properties?: any): void;

    mouseOverComponent(): boolean {
        return (this.globals.cursor().x >= this.x && this.globals.cursor().x <= this.x + this.w &&
            this.globals.cursor().y >= this.y && this.globals.cursor().y <= this.y + this.h);
    }
}