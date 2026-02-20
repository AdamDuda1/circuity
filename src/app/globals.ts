import { Injectable, signal } from '@angular/core';
import { Simulation } from './simulation';
import { Constants } from './constants';
import { ElectricalComponent } from './components/component-type-interface';
import { AND } from './components/and';
import { OR } from './components/or';
import { NOT } from './components/not';
import { Switch } from './components/switch';
import { LED } from './components/led';
import { XOR } from './components/xor';

type ComponentFactory = (globals: Globals, giveID: boolean, x: number, y: number) => ElectricalComponent;

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

	public readonly componentRegistry = new Map<string, ComponentFactory>([
		['AND', (g, id, x, y) => new AND(g, id, x, y)],
		['OR', (g, id, x, y) => new OR(g, id, x, y)],
		['NOT', (g, id, x, y) => new NOT(g, id, x, y)],
		['Switch', (g, id, x, y) => new Switch(g, id, x, y)],
		['LED', (g, id, x, y) => new LED(g, id, x, y)],
		['XOR', (g, id, x, y) => new XOR(g, id, x, y)],
	]);

	public readonly palette = [...this.componentRegistry.values()]
		.map(factory => factory(this, false, -1, -1));

	public debug = false;

	private nextID = 0;
	public getNextID() { return this.nextID++; }
}
