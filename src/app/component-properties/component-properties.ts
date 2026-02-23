import { Component } from '@angular/core';
import { Globals } from '../globals';

@Component({
	selector: 'category',
	standalone: true,
	template: `
		<div class="category-container">
			<div class="category-bar"></div>

			<div class="category-title">
				<ng-content></ng-content>
			</div>

			<div class="category-bar"></div>
		</div>
	`,
	styleUrl: 'component-properties.css'
})
export class Category {}


@Component({
	selector: 'app-component-properties',
	imports: [
		Category
	],
	templateUrl: './component-properties.html',
	styleUrl: './component-properties.css'
})
export class ComponentProperties {
	constructor(public globals: Globals) {}

	change_name(event: Event) { this.globals.simulation.circuitComponents()[this.globals.selected].name = (event.target as HTMLInputElement).value; }

	change_x(event: Event) { this.globals.simulation.circuitComponents()[this.globals.selected].x = Number((event.target as HTMLInputElement).value); }

	change_y(event: Event) { this.globals.simulation.circuitComponents()[this.globals.selected].y = Number((event.target as HTMLInputElement).value); }
}
