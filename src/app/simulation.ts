import { signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';
import { AND } from './components/and';
import { OR } from './components/or';
import { NOT } from './components/not';
import { Globals } from './globals';

export class Simulation {
    constructor(public globals: Globals) {}

    public circuitComponents = signal<ElectricalComponent[]>([]);
    public running = signal(false);

    spawnComponent(name: string, x: number, y: number) {
        let componentConstructor;
        if (name == 'AND') componentConstructor = new AND(this.globals, true, x, y);
        else if (name == 'OR') componentConstructor = new OR(this.globals, true, x, y);
        else if (name == 'NOT') componentConstructor = new NOT(this.globals, true, x, y);
        else return;

        this.globals.simulation.circuitComponents().push(componentConstructor);
    }

    simulate() {
        //console.log('simulate');
    }
}
