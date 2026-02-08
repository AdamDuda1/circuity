import { Simulation } from '../simulation';
import { Injectable, Signal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class CanvasDraw {
    private ctx?: CanvasRenderingContext2D;
    private view?: Signal<{ x: number, y: number, z: number, w: number, h: number }>;

    initialize(ctx: CanvasRenderingContext2D, view: Signal<{ x: number, y: number, z: number, w: number, h: number }>) {
        this.ctx = ctx;
        this.view = view;
    }

    world_to_canvas_x(x_world: number): number { return x_world * this.view!().z + this.view!().w / 2; }

    world_to_canvas_y(y_world: number): number { return y_world * this.view!().z + this.view!().h / 2; }

    drawGrid() {
        if (!this.ctx || !this.view) return;

        //let x = (x + this.view().x) * this.view().z + this.view().w / 2;
        //let y = (y + this.view().y) * this.view().z + this.view().h / 2;

        const ctx = this.ctx;

        const step = Math.pow(5, Math.floor(Math.log10(500 / this.view().z)));
        const xMin = Math.floor((-this.view().w / 2 / this.view().z - this.view().x) / step) * step;
        const xMax = Math.ceil((this.view().w / 2 / this.view().z - this.view().x) / step) * step;
        const yMin = Math.floor((-this.view().h / 2 / this.view().z - this.view().y) / step) * step;
        const yMax = Math.ceil((this.view().h / 2 / this.view().z - this.view().y) / step) * step;

        ctx.strokeStyle = 'rgba(135,135,135,0.2)';
        ctx.lineWidth = 1;

        for (let x = xMin; x <= xMax; x += step) {
            const cx = (x + this.view().x) * this.view().z + this.view().w / 2;
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, this.view().h);
            ctx.stroke();
        }

        for (let y = yMin; y <= yMax; y += step) {
            const cy = (y + this.view().y) * this.view().z + this.view().h / 2;
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(this.view().w, cy);
            ctx.stroke();
        }
    }

    drawWorld(ctx: CanvasRenderingContext2D, simulation: Simulation, view: { x: number, y: number, z: number, w: number, h: number }) {
        if (!this.ctx || !this.view) return;
        simulation.circuitComponents().forEach(component => component.render(ctx, view));
    }

    /**
     * @param ctx - The canvas rendering context
     * @param frame - Required parameter for drawn info and text positioning
     * @param view - Required parameter for drawn info
     * @param cursor - Required parameter for drawn info
     */
    drawDebug(ctx: CanvasRenderingContext2D, frame: { fps: number }, view: { x: number, y: number, z: number, h: number }, cursor: { x: number, y: number }) {
        if (!this.ctx || !this.view) return;
        this.ctx.strokeStyle = 'rgba(135,135,135,0.5)';
        ctx.strokeText(frame.fps.toFixed(2).toString(), 10, view.h - 12 - 28);
        ctx.strokeText('x/y: ' + view.x.toFixed(2).toString() + ' / ' + view.y.toFixed(2).toString() + ' / ' + view.z.toFixed(2).toString(), 10, view.h - 12 - 14);
        ctx.strokeText('crs: ' + cursor.x.toFixed(2).toString() + ' / ' + cursor.y.toFixed(2).toString(), 10, view.h - 12);

        /*this.ctx.fillStyle = 'red';
         this.ctx.beginPath();
         this.ctx.arc(this.world_to_canvas_x(0), this.world_to_canvas_y(0), 5, 0, Math.PI * 2);
         this.ctx.fill();*/

        /*this.ctx.fillStyle = 'red';
         this.ctx.beginPath();
         this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
         this.ctx.fill();
         this.ctx.beginPath();
         this.ctx.arc(0, this.view().h, 5, 0, Math.PI * 2);
         this.ctx.fill();
         this.ctx.beginPath();
         this.ctx.arc(this.view().w, 0, 5, 0, Math.PI * 2);
         this.ctx.fill();
         this.ctx.beginPath();
         this.ctx.arc(this.view().w, this.view().h, 5, 0, Math.PI * 2);
         this.ctx.fill();*/
    }
}