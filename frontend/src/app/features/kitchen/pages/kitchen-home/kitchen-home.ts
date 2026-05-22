import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-kitchen-home',
  templateUrl: './kitchen-home.html',
  styleUrl: './kitchen-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitchenHome {}
