import { Simulation } from '../simulation';
import { Injectable } from '@angular/core';
import { Globals } from '../globals';

@Injectable({providedIn: 'root'})
export class CanvasDraw {
    constructor(public globals: Globals) {}

    drawGrid(ctx: CanvasRenderingContext2D) {
        if (!ctx || !this.globals.view()) return;

        const view = this.globals.view();
        const step = Math.pow(5, Math.floor(Math.log10(500 / view.z)));

        const xMin = Math.floor((-view.w / 2 / view.z - view.x) / step) * step;
        const xMax = Math.ceil((view.w / 2 / view.z - view.x) / step) * step;
        const yMin = Math.floor((-view.h / 2 / view.z + view.y) / step) * step;
        const yMax = Math.ceil((view.h / 2 / view.z + view.y) / step) * step;

        // ctx.strokeStyle = 'rgba(135,135,135,0.2)';
        // ctx.lineWidth = 1;
		ctx.save();

        for (let x = xMin; x <= xMax; x += step) {
            const cx = (x + view.x) * view.z + view.w / 2;
            if (x === 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(94,94,94,0.2)';
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(135,135,135,0.2)';
            }
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, view.h);
            ctx.stroke();
        }

        for (let y = yMin; y <= yMax; y += step) {
            const cy = (-y + view.y) * view.z + view.h / 2;
            if (y === 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(94,94,94,0.2)';
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(135,135,135,0.2)';
            }
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(view.w, cy);
            ctx.stroke();
        }

        const yAxisCanvas = view.y * view.z + view.h / 2;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(135,135,135,0.5)';
        ctx.beginPath();
        ctx.moveTo(view.w - 10, yAxisCanvas - 5);
        ctx.lineTo(view.w, yAxisCanvas);
        ctx.lineTo(view.w - 10, yAxisCanvas + 5);
        ctx.closePath();
        ctx.fill();

        // Y axis arrow (pointing up - at top of screen)
        const xAxisCanvas = view.x * view.z + view.w / 2;
        ctx.beginPath();
        ctx.moveTo(xAxisCanvas - 5, 10);
        ctx.lineTo(xAxisCanvas, 0);
        ctx.lineTo(xAxisCanvas + 5, 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawWorld(ctx: CanvasRenderingContext2D, simulation: Simulation) {
        if (!ctx || !this.globals.view) return;
        const view = this.globals.view();

        ctx.save();
        simulation.circuitComponents().forEach(component => component.render(ctx, view));
        ctx.restore();
    }

    drawDebug(ctx: CanvasRenderingContext2D) {
        if (!ctx || !this.globals.view) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(135,135,135,0.5)';
        ctx.strokeText(this.globals.frame().fps.toFixed(2).toString(), 10, this.globals.view().h - 12 - 28);
        ctx.strokeText('x/y: ' + this.globals.view().x.toFixed(2).toString() + ' / ' + this.globals.view().y.toFixed(2).toString() + ' / ' + this.globals.view().z.toFixed(2).toString(), 10, this.globals.view().h - 12 - 14);
        ctx.strokeText('crs: ' + this.globals.cursor().x.toFixed(2).toString() + ' / ' + this.globals.cursor().y.toFixed(2).toString(), 10, this.globals.view().h - 12);
        ctx.restore();

        /* DEBUGGING DOTS */

        if (this.globals.debug) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.globals.view().w / 2, this.globals.view().h / 2, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, this.globals.view().h, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.globals.view().w, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.globals.view().w, this.globals.view().h, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
