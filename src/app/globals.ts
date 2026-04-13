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
import { Data } from './data';
import { Tutorial } from './tutorial/tutorial';
import { disable as disableDarkMode, enable as enableDarkMode } from 'darkreader';
import { Buzzer } from './components/buzzer';
import { SignalSender } from './components/signal-sender';
import { SignalReceiver } from './components/signal-receiver';
// import * as bootstrap from 'bootstrap';

type ComponentFactory = (giveID: boolean, x: number, y: number) => ElectricalComponent;

@Injectable({
	providedIn: 'root'
})
export class Globals {
	public readonly database: string = 'http://localhost:2137/v1/'; // <- for local (clone /circuity-backend)
	// public readonly database: string = 'https://circuity-backend-production.up.railway.app/v1/';

	public readonly view = signal({
		x: 0,
		y: 0,
		z: 1,
		w: 0,
		h: 0,
		dpr: 1,
		maxWorldX: 0,
		minWorldX: 0,
		maxWorldY: 0,
		minWorldY: 0
	});
	public readonly isPanning = signal(false);
	public readonly isDragging = signal(false);
	public readonly cursor = signal({x: 0, y: 0});
	public readonly frame = signal({dt: 0, fps: 0});
	public canvasCursor = 'default';
	public canvasCursorCandidate = 'default';
	public selected = -1;

	public readonly tutorial_open = signal(false);
	public readonly tutorial_page = signal(0);

	public readonly savePanel_open = signal(false);
	public readonly settingsPanel_open = signal(false);

	public darkMode: boolean = false;
	public snap: boolean = false;
	public snapStep: number = 0;
	public indicationOnWires: boolean = false;
	public historyMax: number = 10;

	public data = new Data(this);
	// public toast = new Toast();
	public tutorial = new Tutorial(this);
	public simulation = new Simulation(this);
	public constants = new Constants();

	public readonly blog_loaded = signal(false);

	public readonly componentRegistry = new Map<string, ComponentFactory>([
		['AND',     (id, x, y) => new AND(this, id, x, y)],
		['OR',      (id, x, y) => new OR(this, id, x, y)],
		['NOT',     (id, x, y) => new NOT(this, id, x, y)],
		['Switch',  (id, x, y) => new Switch(this, id, x, y)],
		['LED',     (id, x, y) => new LED(this, id, x, y)],
		['Buzzer',  (id, x, y) => new Buzzer(this, id, x, y)],
		['XOR',     (id, x, y) => new XOR(this, id, x, y)],
		['Signal Sender', (id, x, y) => new SignalSender(this, id, x, y)],
		['Signal Receiver', (id, x, y) => new SignalReceiver(this, id, x, y)]
	]);

	public readonly palette = [...this.componentRegistry.values()]
		.map(factory => factory(false, -1, -1));

	public debug = false;

	private nextID = 0;

	public getNextID() {
		return this.nextID++;
	}

	public resetNextID(startAt = 0) {
		this.nextID = startAt;
	}

	fetchSettings() {
		this.darkMode = localStorage.getItem('darkMode') === 'true';
		this.snap = localStorage.getItem('snap') === 'true';
		this.snapStep = localStorage.getItem('snapStep') ? Number(localStorage.getItem('snapStep')) : 30;
		this.indicationOnWires = localStorage.getItem('indicationOnWires') === 'true';
		this.historyMax = localStorage.getItem('historyMax') ? Number(localStorage.getItem('historyMax')) : 10;
	}

	setDarkMode() {
		if (this.darkMode) {
			enableDarkMode({
				brightness: 90,
				contrast: 100,
				sepia: 20
			});
		} else disableDarkMode();

		//followSystemColorScheme(); TODO!
	}

	init() { // should not require a reload, if it needs to, change dependencies
		this.fetchSettings();
		this.setDarkMode();
	}
}
