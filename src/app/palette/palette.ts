import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { PaletteCategory } from './palette-category/palette-category';

type Category = {
	name: Signal<string>;
	icon: Signal<string>;
	defaultOpened: boolean;
	components: ElectricalComponent[];
}

@Component({
	selector: 'app-palette',
	imports: [PaletteComponent, PaletteCategory],
	host: {
		'(document:keydown)': 'onDocumentKeydown($event)'
	},
	template: `
		@if (viewMode() === 'list') {
			<div class="scroll">
				@for (component of designComponents(); track component.id) {
					<button class="component-list-item cursor-pointer" type="button"
					        [class.is-selected]="selectedDesignId() === component.id"
					        (click)="selectDesignComponent(component.id)">
						{{ component.name }}
					</button>
				} @empty {
					<div class="component-list-item is-empty">No components in design.</div>
				}
			</div>
		} @else {
			<div class="scroll">
				@for (category of categories; track categories.indexOf(category)) {
					<app-palette-category [name]="category.name()" [icon]="category.icon()"
					                      [defaultOpened]="category.defaultOpened">
						@for (component of category.components; track component.id) {
							<app-palette-component [component]="component"/>
						}
					</app-palette-category>
				}
			</div>
		}


		<div class="mode-switch" role="group" aria-label="Palette view switch">
			<input type="radio" class="btn-check" name="options-base" id="palette" autocomplete="off"
			       [checked]="viewMode() === 'palette'" (change)="setViewMode('palette')">
			<label class="btn" for="palette">
				<span style="position: relative; top: -8px; font-size: 12px;">Palette</span>
			</label>

			<input type="radio" class="btn-check" name="options-base" id="list" autocomplete="off"
			       [checked]="viewMode() === 'list'" (change)="setViewMode('list')">
			<label class="btn" for="list">
				<span style="position: relative; top: -8px; font-size: 12px;">Component list</span>
			</label>
		</div>
	`,
	styles: `
		label {
			height: 20px;
			padding: 7px;
			font-size: 13px;
			align-items: center;
			align-content: center;
		}

		:host {
			box-shadow: 0 0 12px 0 #00000073, inset 0 0 7px 4px #0000000d;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			position: absolute;
			height: calc(100vh - 20px);
			left: 10px;
			top: 10px;
			padding: 2px;
			width: 250px;
		}

		.scroll {
			display: flex;
			flex-direction: column;
		}

		.component-list-item {
			height: 36px;
			margin: 4px 6px;
			padding: 0 12px;
			border: 1px solid transparent;
			border-radius: 12px;
			background: rgba(237, 237, 237, 0.34);
			text-align: left;
			font-size: 13px;
		}

		.component-list-item:hover {
			background: rgba(213, 213, 213, 0.34);
		}

		.component-list-item.is-selected {
			background: rgba(194, 214, 255, 0.45);
			border-color: rgba(63, 113, 235, 0.7);
		}

		.component-list-item.is-empty {
			display: flex;
			align-items: center;
			opacity: 0.75;
		}

		.mode-switch {
			display: flex;
			justify-content: center;
			gap: 4px;
			padding: 6px;
		}

		.mode-switch .btn {
			border-radius: 10px;
			background: rgba(237, 237, 237, 0.34);
			border: 1px solid transparent;
			min-width: 96px;
		}

		.mode-switch input:checked + .btn {
			background: rgba(194, 214, 255, 0.45);
			border-color: rgba(63, 113, 235, 0.7);
		}

		a {
			position: absolute;
			bottom: 7px;
			left: 7px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Palette {
	components = signal<ElectricalComponent[]>([]);
	viewMode = signal<'palette' | 'list'>('palette');
	categories: Category[] = [];
	defaultCategories: string[] = [];
	private globals = inject(Globals);
	designComponents = computed(() => this.globals.simulation.circuitComponents().filter((component) => !component.deleted));

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

		this.syncFavoritesCategory(this.readFavoriteNames());
	}

	setViewMode(mode: 'palette' | 'list'): void {
		this.viewMode.set(mode);
	}

	selectDesignComponent(id: number): void {
		this.globals.setSelected(id);
	}

	selectedDesignId(): number {
		this.globals.selectedVersion();
		return this.globals.selected;
	}

	onDocumentKeydown(event: KeyboardEvent) {
		if (event.key !== 'f' && event.key !== 'F') return;

		const hovered = this.globals.hoveredPaletteComponent();
		if (!hovered) return;

		event.preventDefault();

		const favoriteNames = new Set(this.readFavoriteNames());
		if (favoriteNames.has(hovered.name)) {
			favoriteNames.delete(hovered.name);
		} else {
			favoriteNames.add(hovered.name);
		}

		const nextFavoriteNames = [...favoriteNames];
		this.writeFavoriteNames(nextFavoriteNames);
		this.syncFavoritesCategory(nextFavoriteNames);
	}

	private readFavoriteNames(): string[] {
		try {
			const raw = localStorage.getItem('favorites');
			if (!raw) return [];
			const parsed: unknown = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];

			return parsed.filter((value): value is string => typeof value === 'string');
		} catch {
			return [];
		}
	}

	private writeFavoriteNames(names: string[]): void {
		localStorage.setItem('favorites', JSON.stringify(names));
	}

	private syncFavoritesCategory(favoriteNames: string[]): void {
		const favoriteCategoryName = this.globals.constants.favoriteCategory;
		const favoriteComponents = favoriteNames
		.map((name) => this.components().find((component) => component.name === name))
		.filter((component): component is ElectricalComponent => Boolean(component));

		const existingCategoryIndex = this.categories.findIndex((category) => category.name() === favoriteCategoryName);

		if (favoriteComponents.length === 0) {
			if (existingCategoryIndex !== -1) {
				this.categories.splice(existingCategoryIndex, 1);
			}
			return;
		}

		const category = existingCategoryIndex === -1
			? {name: signal(favoriteCategoryName), icon: signal('star'), defaultOpened: true, components: [] as ElectricalComponent[]}
			: this.categories[existingCategoryIndex];

		category.components = favoriteComponents;

		if (existingCategoryIndex !== -1) {
			this.categories.splice(existingCategoryIndex, 1);
		}

		this.categories.unshift(category);
	}
}
