import { Component, signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { AND } from '../components/and';
import { OR } from '../components/or';
import { NOT } from '../components/not';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { Switch } from '../components/switch';
import { LED } from '../components/led';

@Component({
    selector: 'app-palette',
    imports: [PaletteComponent],
    template: `
        @for (component of components(); track component) {
            <app-palette-component [component]="component" />
        }
    `,
    styleUrl: './palette.css'
})
export class Palette {
    components = signal<ElectricalComponent[]>([]);

    constructor(public globals: Globals) {
        this.components.set([
            new AND(this.globals, false, -1, -1),
            new OR(this.globals, false, -1, -1),
            new NOT(this.globals, false, -1, -1),
            new Switch(this.globals, false, -1, -1),
            new LED(this.globals, false, -1, -1)
        ]);
    }
}
