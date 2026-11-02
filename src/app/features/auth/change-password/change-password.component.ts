import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorResponse } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { matchesField } from '../../../core/validators/match.validator';

@Component({
  selector: 'app-change-password',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  form = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, matchesField('newPassword')]],
  });

  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    // Re-check "confirm" whenever "new password" changes
    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { oldPassword, newPassword } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Password changed. Please sign in with your new password.', 'Close', { duration: 5000 });
        this.auth.logout(); // clears session, goes to /login
      },
      error: (err: ErrorResponse) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }
}