import { Component, signal } from '@angular/core';
import { Globals } from '../globals';

@Component({
    selector: 'app-simulation-controls',
    imports: [],
    templateUrl: './simulation-controls.html',
    styleUrl: './simulation-controls.css'
})
export class SimulationControls {
    constructor(public globals: Globals) {}

    public text = 'Run';
    isHovered = signal(false);
    normalColor = signal('#3fc138');
    //normalColor = signal('#4CAF50');
    //hoverColor = signal('#367c39');
    hoverColor = signal('#4CAF50');

    onClick() {
        if (this.globals.simulation.running()) {
            this.globals.simulation.running.set(false);
            this.text = 'Run';
            this.normalColor.set('#4CAF50');
            this.hoverColor.set('#367c39');
        } else {
            this.globals.simulation.running.set(true);
            this.text = 'Stop';
            this.normalColor.set('#b54747');
            this.hoverColor.set('#a13f3f');
        }
    }
}
