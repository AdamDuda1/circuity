import { Component, ChangeDetectionStrategy, signal, inject, Signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { PaletteCategory } from './palette-category/palette-category';

type Category = {
	name: Signal<string>;
	defaultOpened: boolean;
	components: ElectricalComponent[];
}

@Component({
	selector: 'app-palette',
	imports: [PaletteComponent, PaletteCategory],
	template: `
        @for (category of categories; track categories.indexOf(category)) {
            <app-palette-category [name]="category.name()" [defaultOpened]="category.defaultOpened">
                @for (component of category.components; track component.id) {
                    <app-palette-component [component]="component" />
                }
            </app-palette-category>
        }
    `,
	styleUrl: './palette.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Palette {
	private globals = inject(Globals);
	components = signal<ElectricalComponent[]>([]);
	categories: Category[] = [];
	defaultCategories: string[] = [];

	constructor() {
		this.components.set(this.globals.palette);

		this.defaultCategories = [ // TODO move to globals?
			this.globals.constants.categoryName.basicLogicGates,
			this.globals.constants.categoryName.input,
			this.globals.constants.categoryName.output
		];

		for (const component of this.components()) {
			let category = this.categories.find(c => c.name() == component.category);
			if (!category) {
				category = {name: signal(component.category), defaultOpened: this.defaultCategories.includes(component.category), components: []};
				this.categories.push(category);
			}
			category.components.push(component);
		}

		console.log(this.categories);
		console.log(this.categories[0].name);
	}
}
