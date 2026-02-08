import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Globals {
    public readonly view = signal({x: 0, y: 0, z: 1, w: 0, h: 0, dpr: 1, maxWorldX: 0, minWorldX: 0, maxWorldY: 0, minWorldY: 0});
    public readonly cursor = signal({x: 0, y: 0});
    public readonly frame = signal({dt: 0, fps: 0});
    public canvasCursor = 'default';
    public canvasCursorCandidate = 'default';
}
