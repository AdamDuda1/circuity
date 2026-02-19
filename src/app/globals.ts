import { Injectable, signal } from '@angular/core';
import { Simulation } from './simulation';
import { Constants } from './constants';
import { AND } from './components/and';
import { OR } from './components/or';
import { NOT } from './components/not';
import { Switch } from './components/switch';
import { LED } from './components/led';

@Injectable({
	providedIn: 'root'
})
export class Globals {
	public readonly view = signal({x: 0, y: 0, z: 1, w: 0, h: 0, dpr: 1, maxWorldX: 0, minWorldX: 0, maxWorldY: 0, minWorldY: 0});
	public readonly cursor = signal({x: 0, y: 0});
	public readonly frame = signal({dt: 0, fps: 0});
	public canvasCursor = 'default';
	public canvasCursorCandidate = 'default';
	public selected = -1;
	public simulation = new Simulation(this);
	public constants = new Constants();

	public readonly palette = [
		new AND(this, false, -1, -1),
		new OR(this, false, -1, -1),
		new NOT(this, false, -1, -1),
		new Switch(this, false, -1, -1),
		new LED(this, false, -1, -1)
	];

	public debug = false;

	private nextID = 0;
	public getNextID() { return this.nextID++; }
}
