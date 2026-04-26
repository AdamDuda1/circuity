import { Globals } from './globals';
import { _Toast } from './toasts';
import { ElectricalComponent, SerializedElectricalComponent } from './components/component-type-interface';

interface SavedState {
	components: SerializedElectricalComponent[];
	view: { x: number; y: number; z: number };
}

export class Data {
	constructor(public globals: Globals) {}

	loadLast(): boolean {
		const json = localStorage.getItem('save');
		if (!json) {
			_Toast.error("couldn't load last design :(");
			return false;
		}
		this.loadJSON(JSON.parse(json));
		_Toast.success("Loaded last design!");
		return true;
	}

	saveLast() {
		localStorage.setItem('save', JSON.stringify(this.getCurrentDesignJSON()));
	}

	getCurrentDesignJSON() {
		const activeComponents = this.globals.simulation.circuitComponents().filter((component) => !component.deleted);
		const idToSavedIndex = new Map<number, number>();
		activeComponents.forEach((component, index) => idToSavedIndex.set(component.id, index));
		let minX = 1e7, maxX = -1e7, minY = 1e7, maxY = -1e7;
		activeComponents.forEach((element) => {
			minX = Math.min(minX, element.x);
			maxX = Math.max(maxX, element.x);
			minY = Math.min(minY, element.y);
			maxY = Math.max(maxY, element.y);
		});

		const hasActiveComponents = activeComponents.length > 0;
		const currentView = this.globals.view();

		let _x = 0, _y = 0;
		if (activeComponents.length > 0) {
			_x = hasActiveComponents ? -(minX + maxX) / 2 : currentView.x;
			_y = hasActiveComponents ? (minY + maxY) / 2 : currentView.y;
		}

		return {
			components: activeComponents.map((component) => this.remapConnectionRefsForSave(this.getSparseComponentJSON(component), idToSavedIndex)),
			view: {
				x: _x,
				y: _y,
				z: currentView.z
			}
		} as SavedState;
	}

	loadJSON(json: SavedState, resetHistory = true, changeView = true) {
		try {
			const state: SavedState = json;
			this.globals.clearSelected();
			this.globals.resetNextID(0);

			const loadedComponents: ElectricalComponent[] = [];

			for (const comp of state.components) {
				const factory = this.globals.componentRegistry.get(comp.type);
				if (!factory) {
					console.error(`Unknown component type while loading: ${comp.type}`);
					return false;
				}

				const component = factory(true, comp.x, comp.y);
				component.spawnComponentFromJSON(comp);
				loadedComponents.push(component);
			}

			this.globals.simulation.circuitComponents.set(loadedComponents);

			if (state.view && changeView) this.globals.view.update(v => ({...v, ...state.view}));

			if (resetHistory) {
				this.globals.simulation.history.set([JSON.stringify(state)]);
				this.globals.simulation.currentVersion.set(0);
			}

			return true;
		} catch (e) {
			console.error('Failed to load simulation:', e);
			localStorage.removeItem('simulationData');
			return false;
		}
	}

	private getSparseComponentJSON(component: ElectricalComponent): SerializedElectricalComponent {
		const current = component.getComponentJSON();
		const sparse: SerializedElectricalComponent = {
			type: current.type,
			x: current.x,
			y: current.y
		};

		const factory = this.globals.componentRegistry.get(current.type);
		if (!factory) {
			return sparse;
		}

		const defaults = factory(false, current.x, current.y).getComponentJSON();
		const ignoredKeys = new Set<keyof SerializedElectricalComponent>([
			'type',
			'x',
			'y',
			'color',
			'description',
			'truthTable',
			'gif'
		]);

		for (const key of Object.keys(current) as (keyof SerializedElectricalComponent)[]) {
			if (ignoredKeys.has(key)) continue;
			const value = current[key];
			if (value === undefined) continue;

			if (!this.isDeepEqual(value, defaults[key])) {
				switch (key) {
						case 'label':
							sparse.label = value as string;
							break;
					case 'showLabel':
						sparse.showLabel = value as boolean;
						break;
					case 'inFrom':
						sparse.inFrom = value as SerializedElectricalComponent['inFrom'];
						break;
					case 'outTo':
						sparse.outTo = value as SerializedElectricalComponent['outTo'];
						break;
					case 'custom':
						sparse.custom = value as SerializedElectricalComponent['custom'];
						break;
				}
			}
		}

		return sparse;
	}

	private isDeepEqual(a: unknown, b: unknown): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	private remapConnectionRefsForSave(component: SerializedElectricalComponent, idToSavedIndex: Map<number, number>): SerializedElectricalComponent {
		if (!component.inFrom && !component.outTo) {
			return component;
		}

		const inFrom = component.inFrom?.map((connection) => {
			const mappedComponent = idToSavedIndex.get(connection.component);
			if (mappedComponent === undefined) {
				return {component: -1, pin: -1};
			}

			return {component: mappedComponent, pin: connection.pin};
		});

		const outTo = component.outTo?.map((connections) =>
			connections
				.map((connection) => {
					const mappedComponent = idToSavedIndex.get(connection.component);
					if (mappedComponent === undefined) {
						return null;
					}

					return {component: mappedComponent, pin: connection.pin};
				})
				.filter((connection): connection is { component: number; pin: number } => connection !== null)
		);

		return {
			...component,
			...(inFrom ? {inFrom} : {}),
			...(outTo ? {outTo} : {})
		};
	}
}
