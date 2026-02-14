import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationControls } from './simulation-controls';

describe('SimulationControls', () => {
  let component: SimulationControls;
  let fixture: ComponentFixture<SimulationControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationControls]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationControls);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
