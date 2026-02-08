import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteCategory } from './palette-category';

describe('PaletteCategory', () => {
    let component: PaletteCategory;
    let fixture: ComponentFixture<PaletteCategory>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaletteCategory]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PaletteCategory);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
