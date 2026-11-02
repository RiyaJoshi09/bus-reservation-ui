import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { PHONE_PATTERN } from '../../../core/constants/patterns';
import { AdminProfileResponse, AdminProfileUpdate } from '../../../core/models/admin.models';
import { ErrorResponse } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { roleLabel } from '../../../core/utils/role.utils';
import { DeleteAccountCardComponent } from '../../../shared/components/delete-account-card/delete-account-card.component';
import { ProfileFieldComponent } from '../../../shared/components/profile-field/profile-field.component';

@Component({
  selector: 'app-admin-profile',
  imports: [
    ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, ProfileFieldComponent, DeleteAccountCardComponent,
  ],
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  auth = inject(AuthService);

  readonly roleLabel = roleLabel;

  profile = signal<AdminProfileResponse | null>(null);
  loading = signal(true);
  loadError = signal('');
  editing = signal(false);
  saving = signal(false);
  saveError = signal('');
  deleting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required,Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.profileService.getAdmin().subscribe({
      next: (p) => { this.profile.set(p); this.loading.set(false); },
      error: (err: ErrorResponse) => { this.loadError.set(err.message); this.loading.set(false); },
    });
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.form.reset({ name: p.name, email:p.email, phone: p.phone });
    this.saveError.set('');
    this.editing.set(true);
  }

  cancelEdit(): void { this.editing.set(false); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const payload: AdminProfileUpdate = { name: v.name.trim(), email: v.email.trim(), phone: v.phone };

    this.saving.set(true);
    this.saveError.set('');
    this.profileService.updateAdmin(payload).pipe(
      switchMap(() => this.profileService.getAdmin())
    ).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.editing.set(false);
        this.saving.set(false);
        this.snackBar.open('Profile updated.', 'Close', { duration: 3000 });
      },
      error: (err: ErrorResponse) => { this.saveError.set(err.message); this.saving.set(false); },
    });
  }

  deleteAccount(): void {
    this.deleting.set(true);
    this.profileService.deleteAdmin().subscribe({
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