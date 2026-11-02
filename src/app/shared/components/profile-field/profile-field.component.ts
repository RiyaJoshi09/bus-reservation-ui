import { Component, input } from '@angular/core';

@Component({
  selector: 'app-profile-field',
  host: { class: 'col-12 col-md-6 mb-3' },
  templateUrl: './profile-field.component.html',
})
export class ProfileFieldComponent {
  label = input.required<string>();
  value = input<string | null | undefined>('');
}