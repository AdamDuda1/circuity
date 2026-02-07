import { Component, signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { AND } from '../components/and';
import { OR } from '../components/or';
import { NOT } from '../components/not';

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
    components = signal([
        new AND(-1, -1),
        new OR(-1, -1),
        new NOT(-1, -1)
    ]);
}
