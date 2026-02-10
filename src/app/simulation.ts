import { Injectable, signal } from '@angular/core';
import { ElectricalComponent } from './components/component-type-interface';

export class Simulation {
    public circuitComponents = signal<ElectricalComponent[]>([]);

    simulate() {
        //console.log('simulate');
    }
}
