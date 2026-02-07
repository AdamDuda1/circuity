import { Injectable, signal } from '@angular/core';
import { ElectronicalComponent } from './components/component-type-interface';

@Injectable({providedIn: 'root'})
export class Simulation {
    public circuitComponents = signal<ElectronicalComponent[]>([]);

    simulate() {
        console.log('simulate');
    }
}
