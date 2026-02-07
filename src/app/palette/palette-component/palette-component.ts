import { ChangeDetectionStrategy, input, Component } from '@angular/core';
import { ElectronicalComponent } from '../../components/component-type-interface';

@Component({
  selector: 'app-palette-component',
  imports: [],
  templateUrl: './palette-component.html',
  styleUrl: './palette-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteComponent {
  component = input.required<ElectronicalComponent>();
}
