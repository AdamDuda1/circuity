export abstract class Level {
	id = '';
	abstract name: string;
	abstract descriptionHtml: string;
	abstract restrictComponentList: boolean;
	abstract allowedComponents: string[];

	abstract verify(): boolean;
}
