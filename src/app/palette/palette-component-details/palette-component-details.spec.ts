import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteComponentDetails } from './palette-component-details';

describe('PaletteComponentDetails', () => {
  let component: PaletteComponentDetails;
  let fixture: ComponentFixture<PaletteComponentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteComponentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaletteComponentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
