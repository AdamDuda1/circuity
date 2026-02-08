export interface ElectricalComponent {
    name: string;
    category: string;
    type: string;
    color: string;
    x: number;
    y: number;

    actualSize: { x1: number, y1: number, w: number, h: number };
    ins: { x: number, y: number } [];
    outs: { x: number, y: number } [];

    render(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, w?: number, h?: number,
        properties?: any): void;
}
