export function drawGrid(ctx: CanvasRenderingContext2D, view: {w: number, h: number, x: number, y: number, z: number}) {
  const { w, h, x, y, z } = view;
  const spacing = 20 * z;
  const centerX = w / 2 + x;
  const centerY = h / 2 + y;

  const offsetX = ((centerX % spacing) + spacing) % spacing;
  const offsetY = ((centerY % spacing) + spacing) % spacing;

  ctx.strokeStyle = '#888888';
  ctx.lineWidth = .5;

  for (let gx = offsetX; gx <= w; gx += spacing) {
    if (gx % 200 * z == 0) ctx.lineWidth = 1;
    else ctx.lineWidth = .5;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }

  for (let gy = offsetY; gy <= h; gy += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
}

/**
 * @param ctx - The canvas rendering context
 * @param frame - Required parameter for drawn info and text positioning
 * @param view - Required parameter for drawn info
 * @param cursor - Required parameter for drawn info
 */
export function drawDebug(ctx: CanvasRenderingContext2D, frame: {fps: number}, view: {x: number, y: number, z:number, h: number}, cursor: {x: number, y: number}) {
  ctx.strokeText(frame.fps.toFixed(2).toString(), 10, view.h - 12 - 28);
  ctx.strokeText("x/y: " + view.x.toFixed(2).toString() + " / " + view.y.toFixed(2).toString() + " / " + view.z.toFixed(2).toString(), 10, view.h - 12 - 14);
  ctx.strokeText("crs: " + cursor.x.toFixed(2).toString() + " / " + cursor.y.toFixed(2).toString(), 10, view.h - 12);
}
