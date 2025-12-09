import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ConfirmDialogData = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-4 space-y-4">
      <div>
        <p class="text-lg font-semibold text-slate-900">{{ data.title || 'Konfirmasi' }}</p>
        <p class="text-sm text-slate-600 mt-1">{{ data.message || 'Lanjutkan tindakan ini?' }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Batal' }}
        </button>
        <button type="button" class="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
                (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Hapus' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}
}
