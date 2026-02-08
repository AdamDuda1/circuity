import { Simulation } from '../simulation';
import { Injectable, Signal } from '@angular/core';
import { Globals } from '../globals';

@Injectable({providedIn: 'root'})
export class CanvasDraw {
    constructor(public globals: Globals) {}

    drawGrid(ctx: CanvasRenderingContext2D) {
        if (!ctx || !this.globals.view()) return;

        const step = Math.pow(5, Math.floor(Math.log10(500 / this.globals.view().z)));
        const xMin = Math.floor((-this.globals.view().w / 2 / this.globals.view().z - this.globals.view().x) / step) * step;
        const xMax = Math.ceil((this.globals.view().w / 2 / this.globals.view().z - this.globals.view().x) / step) * step;
        const yMin = Math.floor((-this.globals.view().h / 2 / this.globals.view().z - this.globals.view().y) / step) * step;
        const yMax = Math.ceil((this.globals.view().h / 2 / this.globals.view().z - this.globals.view().y) / step) * step;

        ctx.strokeStyle = 'rgba(135,135,135,0.2)';
        ctx.lineWidth = 1;

        for (let x = xMin; x <= xMax; x += step) {
            const cx = (x + this.globals.view().x) * this.globals.view().z + this.globals.view().w / 2;
            if (x === 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(94,94,94,0.2)';
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(135,135,135,0.2)';
            }
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, this.globals.view().h);
            ctx.stroke();
        }

        for (let y = yMin; y <= yMax; y += step) {
            const cy = (y + this.globals.view().y) * this.globals.view().z + this.globals.view().h / 2;
            if (y === 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(94,94,94,0.2)';
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(135,135,135,0.2)';
            }
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(this.globals.view().w, cy);
            ctx.stroke();
        }


        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(135,135,135,0.5)';
        ctx.beginPath();
        ctx.moveTo(this.globals.view().w - 10, (this.globals.view().y) * this.globals.view().z + this.globals.view().h / 2 - 10 / 2);
        ctx.lineTo(this.globals.view().w, (this.globals.view().y) * this.globals.view().z + this.globals.view().h / 2);
        ctx.lineTo(this.globals.view().w - 10, (this.globals.view().y) * this.globals.view().z + this.globals.view().h / 2 + 10 / 2);
        ctx.stroke();
        // ctx.closePath();
        // ctx.fill();

        ctx.beginPath();
        ctx.moveTo((this.globals.view().x) * this.globals.view().z + this.globals.view().w / 2 - 10 / 2, 10);
        ctx.lineTo((this.globals.view().x) * this.globals.view().z + this.globals.view().w / 2, 0);
        ctx.lineTo((this.globals.view().x) * this.globals.view().z + this.globals.view().w / 2 + 10 / 2, 10);
        ctx.stroke();
        // ctx.closePath();
        // ctx.fill();
    }

    drawWorld(ctx: CanvasRenderingContext2D, simulation: Simulation) {
        if (!ctx || !this.globals.view) return;
        simulation.circuitComponents().forEach(component => component.render(ctx, this.globals.view()));
    }

    drawDebug(ctx: CanvasRenderingContext2D) {
        if (!ctx || !this.globals.view) return;
        ctx.strokeStyle = 'rgba(135,135,135,0.5)';
        ctx.strokeText(this.globals.frame().fps.toFixed(2).toString(), 10, this.globals.view().h - 12 - 28);
        ctx.strokeText('x/y: ' + this.globals.view().x.toFixed(2).toString() + ' / ' + this.globals.view().y.toFixed(2).toString() + ' / ' + this.globals.view().z.toFixed(2).toString(), 10, this.globals.view().h - 12 - 14);
        ctx.strokeText('crs: ' + this.globals.cursor().x.toFixed(2).toString() + ' / ' + this.globals.cursor().y.toFixed(2).toString(), 10, this.globals.view().h - 12);

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