import { Component, input } from '@angular/core';

@Component({
	selector: 'app-palette-component-details',
	imports: [],
	templateUrl: './palette-component-details.html',
	styleUrl: './palette-component-details.css'
})
export class PaletteComponentDetails {
	name = input.required<string>();
	description = input.required<string>();
}
