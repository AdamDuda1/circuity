import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelInfo } from './level-info';

describe('LevelInfo', () => {
  let component: LevelInfo;
  let fixture: ComponentFixture<LevelInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
