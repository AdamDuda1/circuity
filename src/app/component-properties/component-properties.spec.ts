import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentProperties } from './component-properties';

describe('ComponentProperties', () => {
  let component: ComponentProperties;
  let fixture: ComponentFixture<ComponentProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentProperties);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
