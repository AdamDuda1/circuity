import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePanel } from './save-panel';

describe('SavePanel', () => {
  let component: SavePanel;
  let fixture: ComponentFixture<SavePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
