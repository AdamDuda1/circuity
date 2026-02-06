import { Component } from '@angular/core';
import {PaletteComponent} from './palette-component/palette-component';

@Component({
  selector: 'app-palette',
  imports: [PaletteComponent],
  templateUrl: './palette.html',
  styleUrl: './palette.css',
})
export class Palette {
 // npx --package @angular/cli ng g c palette
}
