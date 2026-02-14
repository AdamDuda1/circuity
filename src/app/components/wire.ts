export function drawWire(ctx: CanvasRenderingContext2D, view: { x: number, y: number, z: number, w: number, h: number }, p1: { x: number, y: number }, p2: { x: number, y: number }) {
    const screenX1 = (p1.x + view.x) * view.z + view.w / 2;
    const screenY1 = (-(p1.y) + view.y) * view.z + view.h / 2;
    const screenX2 = (p2.x + view.x) * view.z + view.w / 2;
    const screenY2 = (-(p2.y) + view.y) * view.z + view.h / 2;

    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5 * view.z;

    if (p2.x - p1.x < 0) { // TODO fix: reversed while connecting
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        const midY = (screenY1 + screenY2) / 2;
        const margin = 40;
        const mid1 = midY + (p1.y > p2.y ? margin : -margin) * view.z;
        const mid2 = midY - (p1.y > p2.y ? margin : -margin) * view.z;
        ctx.bezierCurveTo(screenX1, mid1, screenX2, mid2, screenX2, screenY2);
    } else {
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        const midX = (screenX1 + screenX2) / 2;
        ctx.bezierCurveTo(midX, screenY1, midX, screenY2, screenX2, screenY2);
    }

    ctx.stroke();
    ctx.restore();
}