import { Component, ChangeDetectionStrategy, signal, inject, Signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { PaletteCategory } from './palette-category/palette-category';
import { PaletteComponentDetails } from './palette-component-details/palette-component-details';

type Category = {
	name: Signal<string>;
	icon: Signal<string>;
	defaultOpened: boolean;
	components: ElectricalComponent[];
}

@Component({
	selector: 'app-palette',
	imports: [PaletteComponent, PaletteCategory, PaletteComponentDetails],
	template: `
        @for (category of categories; track categories.indexOf(category)) {
            <app-palette-category [name]="category.name()" [icon]="category.icon()"
                                  [defaultOpened]="category.defaultOpened">
                @for (component of category.components; track component.id) {
                    <app-palette-component [component]="component"/>
                }
            </app-palette-category>
        }

	`,
	//<app-palette-component-details [description]='"a"' [name]='"a"'></app-palette-component-details>

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
				category = {name: signal(component.category), icon: signal(''), defaultOpened: this.defaultCategories.includes(component.category), components: []};
				this.categories.push(category);
			}
			category.components.push(component);
		}

		const favorites: Category = {name: signal(this.globals.constants.favoriteCategory), icon: signal('star'), defaultOpened: true, components: []};

		const favoritesIDs = JSON.parse(localStorage.getItem('favorites') ?? '[]') as number[];
		for (const id of favoritesIDs) {
			const component = this.components().find(c => c.id == id);
			if (component) favorites.components.push(component);
		}

		if (favoritesIDs.length > 0) {
			this.categories.unshift(favorites);
		}
	}
}
