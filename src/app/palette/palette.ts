import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, Signal } from '@angular/core';
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
				@for (category of categories(); track category.name()) {
					@if (true) {
						<app-palette-category [name]="category.name()" [icon]="category.icon()"
						                      [defaultOpened]="category.defaultOpened || this.globals.isPlayRoute()">
							@for (component of category.components; track component.id) {
								<app-palette-component [component]="component"/>
							}
						</app-palette-category>
					}
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
            overflow: auto;
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
		
        @media (max-width: 600px) {
            :host {
                width: calc(100vw - 20px);
                height: 20vh;
                bottom: 20px !important;
                top: inherit;
            }

	        .scroll {
                max-height: 25vh;
                overflow: auto;
	        }
        }
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Palette {
	restrictComponentList = input(false);
	allowedComponents = input<string[]>([]);
	components = signal<ElectricalComponent[]>([]);
	viewMode = signal<'palette' | 'list'>('palette');
	categories = signal<Category[]>([]);
	defaultCategories: string[] = [];
	globals = inject(Globals);
	designComponents = computed(() => this.globals.simulation.circuitComponents().filter((component) => !component.deleted));
	filteredComponents = computed(() => {
		if (!this.restrictComponentList()) {
			return this.components();
		}

		const allowed = new Set(this.allowedComponents());
		return this.components().filter((component) => allowed.has(component.name));
	});

	constructor() {
		this.components.set(this.globals.palette);

		this.defaultCategories = [ // TODO move to globals?
			this.globals.constants.categoryName.basicLogicGates,
			this.globals.constants.categoryName.input,
			this.globals.constants.categoryName.output
		];

		effect(() => {
			this.rebuildCategories();
		});
	}

	private rebuildCategories(): void {
		const nextCategories: Category[] = [];

		for (const component of this.filteredComponents()) {
			let category = nextCategories.find((c) => c.name() === component.category);
			if (!category) {
				category = {
					name: signal(component.category),
					icon: signal(''),
					defaultOpened: this.defaultCategories.includes(component.category),
					components: []
				};
				nextCategories.push(category);
			}

			category.components.push(component);
		}

		this.categories.set(this.withFavoritesCategory(nextCategories, this.readFavoriteNames()));
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
		if (event.repeat) return;
		if (this.isTextEditingTarget(event.target)) return;

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
		this.categories.update((currentCategories) => this.withFavoritesCategory(currentCategories, nextFavoriteNames));
	}

	private readFavoriteNames(): string[] {
		try {
			const raw = localStorage.getItem('favorites');
			if (!raw) return [];
			if (raw.length > 10_000) {
				localStorage.removeItem('favorites');
				return [];
			}
			const parsed: unknown = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];

			const availableNames = new Set(this.components().map((component) => component.name));
			const names = new Set<string>();
			for (const value of parsed) {
				if (typeof value !== 'string') continue;
				if (!availableNames.has(value)) continue;
				names.add(value);
			}

			return [...names];
		} catch {
			return [];
		}
	}

	private isTextEditingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		if (target.isContentEditable) return true;
		if (target instanceof HTMLTextAreaElement) return true;

		if (target instanceof HTMLInputElement) {
			const nonTextTypes = new Set(['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']);
			return !nonTextTypes.has(target.type);
		}

		return false;
	}

	private writeFavoriteNames(names: string[]): void {
		try {
			localStorage.setItem('favorites', JSON.stringify(names));
		} catch {
			// Ignore storage quota/private-mode errors to avoid breaking UX.
		}
	}

	private withFavoritesCategory(baseCategories: Category[], favoriteNames: string[]): Category[] {
		const favoriteCategoryName = this.globals.constants.favoriteCategory;
		const favoriteComponents = favoriteNames
		.map((name) => this.filteredComponents().find((component) => component.name === name))
		.filter((component): component is ElectricalComponent => Boolean(component));
		const nextCategories = [...baseCategories];

		const existingCategoryIndex = nextCategories.findIndex((category) => category.name() === favoriteCategoryName);

		if (favoriteComponents.length === 0) {
			if (existingCategoryIndex !== -1) {
				nextCategories.splice(existingCategoryIndex, 1);
			}
			return nextCategories;
		}

		const category = existingCategoryIndex === -1
			? {name: signal(favoriteCategoryName), icon: signal('star'), defaultOpened: true, components: [] as ElectricalComponent[]}
			: nextCategories[existingCategoryIndex];

		category.components = favoriteComponents;

		if (existingCategoryIndex !== -1) {
			nextCategories.splice(existingCategoryIndex, 1);
		}

		nextCategories.unshift(category);
		return nextCategories;
	}
}
