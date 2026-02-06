import { Component, AfterViewInit, ElementRef, ChangeDetectionStrategy, OnDestroy, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*host: {
    '(wheel)': 'onWheel($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointerleave)': 'onPointerUp($event)',
    '[style.cursor]': 'this.isPanning() ? "grabbing" : "default"',
  },*/
})
export class Canvas implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly view = signal({ x: 0, y: 0, z: 1, w: 0, h: 0, dpr: 1 });
  protected readonly isPanning = signal(false);
  protected readonly frame = signal({ dt: 0, fps: 0 });
  private readonly targetZ = signal(1);
  private readonly lastPointer = signal({ x: 0, y: 0 });
  private ctx!: CanvasRenderingContext2D;
  private rafId = 0;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    const canvas = this.canvasRef().nativeElement;

    this.updateCanvasSize(canvas);

    this.resizeObserver = new ResizeObserver(() => this.updateCanvasSize(canvas));
    this.resizeObserver.observe(canvas);

    this.startLoop(canvas);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
  }

  /*onWheel(event: WheelEvent) {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.targetZ.update((z) => this.clamp(z * factor, 0.2, 10));
  }*/

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const v = this.view();
    const rawFactor = event.deltaY <0 ?1.1 :1 /1.1;
    const nextZ = this.clamp(v.z * rawFactor,0.2,10);
    const factor = nextZ / v.z;
    const centerX = v.x + v.w /2;
    const centerY = v.y + v.h /2;

    //this.targetZ.set(nextZ);
    this.targetZ.update((z) => this.clamp(z * factor, 0.2, 10));

    this.view.update((prev) => ({
      ...prev,
      x: centerX - (centerX - prev.x) / factor,
      y: centerY - (centerY - prev.y) / factor,
    }));
  }

  onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    this.isPanning.set(true);
    this.lastPointer.set({ x: event.clientX, y: event.clientY });
    (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isPanning()) return;
    // this.ctx.canvas.style.cursor = 'grabbing'; // TODO cursors
    const last = this.lastPointer();
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    this.lastPointer.set({ x: event.clientX, y: event.clientY });
    this.view.update((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }

  onPointerUp(event: PointerEvent) {
    this.isPanning.set(false);
    (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
  }

  private startLoop(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;

    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      this.frame.update((v) => ({ ...v, dt: now - last }));
      this.frame.update((v) => ({ ...v, fps: this.frame().dt > 0 ?1000 / this.frame().dt : 0 }));
      //this.view.update((v) => ({ ...v, w: canvas.width, h: canvas.height })); TODO
      last = now;

      const v = this.view();
      const nextZ = v.z + (this.targetZ() - v.z) * 0.15;
      if (Math.abs(nextZ - v.z) > 0.0001) {
        this.view.update((prev) => ({ ...prev, z: nextZ }));
      }
      this.draw(this.ctx);
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private updateCanvasSize(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    this.view.update((v) => ({ ...v, w: rect.width, h: rect.height, dpr }));
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { w, h, dpr } = this.view();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    this.drawGrid(ctx);

    ctx.strokeText(this.frame().fps.toFixed(3).toString(), 10, this.view().h - 12 - 14);
    ctx.strokeText("x/y: " + this.view().x.toString() + " / " + this.view().y.toString() + " / " + this.view().z.toString(), 10, this.view().h - 12);


  }

  drawGrid(ctx: CanvasRenderingContext2D) {
    const { w, h, x, y, z } = this.view();
    const spacing = 20 * z;
    const centerX = w / 2 + x;
    const centerY = h / 2 + y;

    const offsetX = ((centerX % spacing) + spacing) % spacing;
    const offsetY = ((centerY % spacing) + spacing) % spacing;

    ctx.strokeStyle = '#888888';
    ctx.lineWidth = .5;

    for (let gx = offsetX; gx <= w; gx += spacing) {
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

  private clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }
}
