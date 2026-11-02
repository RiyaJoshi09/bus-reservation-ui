import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-delete-account-card',
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  styles: [`
    mat-card { border: 1px solid var(--color-dark-red); }
    .danger-title { color: var(--color-dark-red); }
  `],
  templateUrl: './delete-account-card.component.html',
})
export class DeleteAccountCardComponent {
  username = input.required<string>();
  busy = input(false);
  confirmed = output<void>();

  open = signal(false);
  typed = signal('');

  cancel(): void {
    this.open.set(false);
    this.typed.set('');
  }
}