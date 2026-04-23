
export abstract class Level {
	abstract id: string;
	abstract name: string;
	abstract descriptionHtml: string;
	abstract restrictComponentList: boolean;
	abstract allowedComponents: string[];

	abstract verify(): boolean;
}
