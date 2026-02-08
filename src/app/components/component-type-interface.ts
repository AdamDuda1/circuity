export interface ElectronicalComponent {
    name: string;
    category: string;
    type: string;
    color: string;
    x: number;
    y: number;

    render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, w?: number, h?: number,
        properties?: any): void;
}
