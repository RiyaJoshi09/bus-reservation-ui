import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MANAGER_ROLES } from '../../../core/constants/form-options';
import { PHONE_PATTERN, USERNAME_PATTERN } from '../../../core/constants/patterns';
import { AdminCreate, ManagerRole } from '../../../core/models/admin.models';
import { ErrorResponse } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { ManagerService } from '../../../core/services/manager.service';
import { addRolePrefix } from '../../../core/utils/role.utils';

interface CreatedManager { name: string; username: string; password: string; roleLabel: string; }

@Component({
  selector: 'app-create-manager',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './create-manager.component.html',
})
export class CreateManagerComponent {
  private fb = inject(FormBuilder);
  private managerService = inject(ManagerService);
  private snackBar = inject(MatSnackBar);

  readonly roles = MANAGER_ROLES;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.minLength(4), Validators.pattern(USERNAME_PATTERN)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    role: [null as ManagerRole | null, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');
  created = signal<CreatedManager | null>(null);

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'; // no look-alikes (0/O, 1/l)
    const bytes = crypto.getRandomValues(new Uint32Array(12));
    const password = Array.from(bytes, (b) => chars[b % chars.length]).join('');
    this.form.controls.password.setValue(password);
    this.hidePassword.set(false); // show it so the Super Manager can pass it on
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: AdminCreate = {
      username: v.username.trim(),
      password: v.password,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone,
      role: v.role!,
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.managerService.create(payload).subscribe({
      next: () => {
        const label = this.roles.find((r) => r.value === payload.role)?.label ?? payload.role;
        this.created.set({ name: payload.name, username: payload.username, password: payload.password, roleLabel: label });
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }

  async copyCredentials(): Promise<void> {
    const c = this.created();
    if (!c) return;
    try {
      await navigator.clipboard.writeText(`Username: ${c.username}\nTemporary password: ${c.password}`);
      this.snackBar.open('Credentials copied.', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Could not copy. Please select and copy manually.', 'Close', { duration: 4000 });
    }
  }

  createAnother(): void {
    this.created.set(null);
    this.form.reset();
    this.hidePassword.set(true);
  }
}