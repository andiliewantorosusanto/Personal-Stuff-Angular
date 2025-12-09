import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})

export class TopBarComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
