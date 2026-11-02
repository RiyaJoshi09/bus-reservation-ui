import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GENDERS, INDIAN_STATES } from '../../../core/constants/form-options';
import { ErrorResponse } from '../../../core/models/auth.models';
import { UserRegisterRequest } from '../../../core/models/user.models';
import { UserService } from '../../../core/services/user.service';
import { toLocalDateString } from '../../../core/utils/date.utils';
import { matchesField } from '../../../core/validators/match.validator';
import { PHONE_PATTERN, USERNAME_PATTERN } from '../../../core/constants/patterns';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private user = inject(UserService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly genders = GENDERS;
  readonly states = INDIAN_STATES;
  readonly today = new Date();

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.pattern(USERNAME_PATTERN)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    birthday: [null as Date | null, Validators.required],
    gender: ['', Validators.required],
    stateOfResidence: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, matchesField('password')]],
  });

  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    // Build the payload explicitly: it must match the Java DTO exactly,
    // so confirmPassword is NOT sent and birthday becomes a string.
    const payload: UserRegisterRequest = {
      username: v.username.trim(),
      password: v.password,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone,
      birthday: toLocalDateString(v.birthday!),
      gender: v.gender,
      stateOfResidence: v.stateOfResidence,
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.user.register(payload).subscribe({
      next: () => {
        this.snackBar.open('Registration successful. Please sign in.', 'Close', { duration: 5000 });
        this.router.navigateByUrl('/login');
      },
      error: (err: ErrorResponse) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }
}