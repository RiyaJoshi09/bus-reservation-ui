import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorResponse } from '../../../core/models/auth.models';
import { ProviderRegisterRequest } from '../../../core/models/provider.models';
import { ProviderService } from '../../../core/services/provider.service';

function validRegex(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null; // "required" handles empty
  try {
    new RegExp(value);
    return null;
  } catch {
    return { invalidRegex: true };
  }
}

@Component({
  selector: 'app-provider-register',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './provider-register.component.html',
})
export class ProviderRegisterComponent {
  private fb = inject(FormBuilder);
  private providerService = inject(ProviderService);

  form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(100)]],
    companyEmail: ['', [Validators.required, Validators.email]],
    pnrRegex: ['', [Validators.required, validRegex]],
  });

  loading = signal(false);
  errorMessage = signal('');
  registeredCompany = signal<string | null>(null); // switches the view to "success"

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: ProviderRegisterRequest = {
      companyName: v.companyName.trim(),
      companyEmail: v.companyEmail.trim(),
      pnrRegex: v.pnrRegex, // NOT trimmed: spaces can be meaningful in a regex
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.providerService.register(payload).subscribe({
      next: () => {
        this.registeredCompany.set(payload.companyName);
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }
}