import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { AND } from './components/and';
import { OR } from './components/or';
import { NOT } from './components/not';
import { Globals } from './globals';
import { Switch } from './components/switch';
import { LED } from './components/led';

export class Simulation {
    constructor(public globals: Globals) {}

    public circuitComponents = signal<ElectricalComponent[]>([]);
    public running = signal(false);

    switch() {
        this.running.set(!this.running());
    }

    spawnComponent(name: string, x: number, y: number) {
        let componentConstructor;
        if (name == 'AND') componentConstructor = new AND(this.globals, true, x, y);
        else if (name == 'OR') componentConstructor = new OR(this.globals, true, x, y);
        else if (name == 'NOT') componentConstructor = new NOT(this.globals, true, x, y);
        else if (name == 'Switch') componentConstructor = new Switch(this.globals, true, x, y);
        else if (name == 'LED') componentConstructor = new LED(this.globals, true, x, y);
        else return;

        this.globals.simulation.circuitComponents().push(componentConstructor);
    }

    simulate() {
        for (const component of this.circuitComponents()) component.simulate();
    }

    stop() {
        // TODO reset all states
    }
}
