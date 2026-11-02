import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-placeholder',
  imports: [MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>{{ title }}</span>
      <span class="flex-fill"></span>
      <span class="me-3">{{ auth.username() }} ({{ auth.role() }})</span>
      <button mat-button (click)="auth.logout()">Logout</button>
    </mat-toolbar>
    <div class="container py-4"><p>Feature screens will live here.</p></div>
  `,
})
export class PlaceholderComponent {
  auth = inject(AuthService);
  title = inject(ActivatedRoute).snapshot.data['title'];
}