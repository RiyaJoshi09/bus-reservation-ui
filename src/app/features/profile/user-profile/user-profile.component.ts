import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { GENDERS, INDIAN_STATES } from '../../../core/constants/form-options';
import { PHONE_PATTERN } from '../../../core/constants/patterns';
import { ErrorResponse } from '../../../core/models/auth.models';
import { UserProfile, UserProfileUpdate } from '../../../core/models/user.models';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { fromLocalDateString, toLocalDateString } from '../../../core/utils/date.utils';
import { DeleteAccountCardComponent } from '../../../shared/components/delete-account-card/delete-account-card.component';
import { ProfileFieldComponent } from '../../../shared/components/profile-field/profile-field.component';

@Component({
  selector: 'app-user-profile',
  imports: [
    ReactiveFormsModule, DatePipe, TitleCasePipe, MatCardModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatProgressSpinnerModule,
    ProfileFieldComponent, DeleteAccountCardComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  readonly genders = GENDERS;
  readonly states = INDIAN_STATES;
  readonly today = new Date();

  profile = signal<UserProfile | null>(null);
  loading = signal(true);
  loadError = signal('');
  editing = signal(false);
  saving = signal(false);
  saveError = signal('');
  deleting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    birthday: [null as Date | null, Validators.required],
    gender: ['', Validators.required],
    stateOfResidence: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.profileService.getUser().subscribe({
      next: (p) => { this.profile.set(p); this.loading.set(false); },
      error: (err: ErrorResponse) => { this.loadError.set(err.message); this.loading.set(false); },
    });
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.form.reset({
      name: p.name,
      phone: p.phone,
      birthday: fromLocalDateString(p.birthday),
      gender: p.gender,
      stateOfResidence: p.stateOfResidence,
    });
    this.saveError.set('');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: UserProfileUpdate = {
      name: v.name.trim(),
      phone: v.phone,
      birthday: toLocalDateString(v.birthday!),
      gender: v.gender,
      stateOfResidence: v.stateOfResidence,
    };

    this.saving.set(true);
    this.saveError.set('');

    this.profileService.updateUser(payload).pipe(
      switchMap(() => this.profileService.getUser())
    ).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.editing.set(false);
        this.saving.set(false);
        this.snackBar.open('Profile updated.', 'Close', { duration: 3000 });
      },
      error: (err: ErrorResponse) => {
        this.saveError.set(err.message);
        this.saving.set(false);
      },
    });
  }

  deleteAccount(): void {
    this.deleting.set(true);
    this.profileService.deleteUser().subscribe({
      next: () => {
        this.snackBar.open('Your account has been deleted.', 'Close', { duration: 5000 });
        this.auth.logout();
      },
      error: (err: ErrorResponse) => {
        this.deleting.set(false);
        this.snackBar.open(err.message, 'Close', { duration: 6000 });
      },
    });
  }
}