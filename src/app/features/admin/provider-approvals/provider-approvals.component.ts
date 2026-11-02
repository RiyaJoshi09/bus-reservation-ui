import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ErrorResponse } from '../../../core/models/auth.models';
import { ProviderService } from '../../../core/services/provider.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AgreementStatus, ProviderResponse } from '../../../core/models/provider.models';


type StatusFilter = 'ALL' | AgreementStatus;

interface StatusAction {
  target: AgreementStatus;
  label: string;
  title: string;
  message: (company: string) => string;
  doneText: string;
}

const ACTIONS: Record<string, StatusAction[]> = {
  PENDING: [{
    target: 'ACTIVE', label: 'Approve', title: 'Approve agreement?',
    message: (c) => `Approving ${c} will activate its agreement and generate its Super Manager credentials.`,
    doneText: 'approved',
  }],
  ACTIVE: [{
    target: 'INACTIVE', label: 'Deactivate', title: 'Deactivate partnership?',
    message: (c) => `Deactivate the partnership with ${c}? You can reactivate it later.`,
    doneText: 'deactivated',
  }],
  INACTIVE: [{
    target: 'ACTIVE', label: 'Reactivate', title: 'Reactivate partnership?',
    message: (c) => `Reactivate the partnership with ${c}?`,
    doneText: 'reactivated',
  }],
};

@Component({
  selector: 'app-provider-approvals',
  imports: [MatTableModule, MatButtonModule, MatButtonToggleModule, MatProgressSpinnerModule],
  templateUrl: './provider-approvals.component.html',
  styles: [`
    .status-badge { padding: .2rem .7rem; border-radius: 1rem; font-size: .8rem; font-weight: 600; }
    .status-pending  { background: var(--color-sky-blue); color: var(--color-navy); }
    .status-active   { background: var(--color-navy); color: #fff; }
    .status-inactive { background: var(--color-dark-red); color: #fff; }
  `],
})

export class ProviderApprovalsComponent implements OnInit {
  private providerService = inject(ProviderService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly columns = ['companyName', 'status', 'actions'];

  providers = signal<ProviderResponse[]>([]);
  filter = signal<StatusFilter>('PENDING');
  loading = signal(true);
  errorMessage = signal('');
  busyId = signal<string | null>(null); // which row has a request in flight

  // Recomputes automatically when providers or filter change
  visible = computed(() => {
    const f = this.filter();
    const all = this.providers();
    return f === 'ALL' ? all : all.filter((p) => p.agreementStatus === f);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.providerService.getAll().subscribe({
      next: (list) => {
        this.providers.set(list);
        this.loading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }

  actionsFor(p: ProviderResponse): StatusAction[] {
    return ACTIONS[p.agreementStatus] ?? [];
  }

  decide(provider: ProviderResponse, action: StatusAction): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: action.title,
          message: action.message(provider.companyName),
          confirmText: action.label,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.busyId.set(provider.id);
        this.providerService.updateAgreement(provider.id, action.target).subscribe({
          next: () => {
            this.providers.update((list) =>
              list.map((p) => (p.id === provider.id ? { ...p, agreementStatus: action.target } : p))
            );
            this.busyId.set(null);
            this.snackBar.open(`${provider.companyName} ${action.doneText}.`, 'Close', { duration: 4000 });
          },
          error: (err: ErrorResponse) => {
            this.busyId.set(null);
            this.snackBar.open(err.message, 'Close', { duration: 6000 });
          },
        });
      });
  }

}