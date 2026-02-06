import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteComponent } from './palette-component';

describe('PaletteComponent', () => {
  let component: PaletteComponent;
  let fixture: ComponentFixture<PaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaletteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
