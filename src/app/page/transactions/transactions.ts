import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { FinanceDataService, Transaction, WALLET_STYLES, WalletStyle } from '../finance/finance-data.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './transactions.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .icon-center {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      @media print {
        body * {
          visibility: hidden;
        }
        #transactions-section,
        #transactions-section * {
          visibility: visible;
        }
        #transactions-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          margin: 12mm;
        }
      }
    `,
  ],
})
export class TransactionsPage {
  walletName = '';
  walletInitial: string | number = '0';
  editingWalletId: string | null = null;
  showWalletModal = false;
  walletStyleId = WALLET_STYLES[0].id;
  walletIcon = 'account_balance_wallet';

  txWalletId = '';
  txCategory = '';
  txValue: string | number = '0';
  txDescription = '';
  txDate = this.today();
  editingTxId: string | null = null;
  iconOptions = ['account_balance_wallet', 'savings', 'credit_card', 'account_balance', 'wallet'];

  constructor(protected finance: FinanceDataService) {
    this.txWalletId = this.defaultWalletId();
    this.txCategory = this.finance.categories()[0]?.name ?? '';
    this.walletStyleId = WALLET_STYLES[0].id;
  }

  get wallets() {
    return this.finance.wallets();
  }

  get categories() {
    return this.finance.categories();
  }

  get transactionsByDay() {
    return this.finance.transactionsByDay();
  }

  get walletStyles() {
    return WALLET_STYLES;
  }

  exportPDF() {
    window.print();
  }

  categoryIcon(name: string) {
    return this.finance.categoryIcon(name);
  }

  walletLabel(id: string) {
    return this.finance.walletLabel(id);
  }

  currentBalance(walletId: string) {
    return this.finance.walletBalances()[walletId] ?? 0;
  }

  saveWallet() {
    const name = this.walletName.trim();
    if (!name) return;
    const initial = this.parseAmount(this.walletInitial);
    const styleId = this.walletStyleId || WALLET_STYLES[0].id;
    const icon = this.walletIcon?.trim() || 'account_balance_wallet';
    this.finance.upsertWallet({ id: this.editingWalletId ?? undefined, name, initial, styleId, icon });
    this.resetWalletForm();
  }

  editWallet(id: string) {
    const wallet = this.wallets.find((w) => w.id === id);
    if (!wallet) return;
    this.editingWalletId = id;
    this.walletName = wallet.name;
    this.walletInitial = this.formatNumber(wallet.initial);
    this.walletStyleId = wallet.styleId || WALLET_STYLES[0].id;
    this.walletIcon = wallet.icon || 'account_balance_wallet';
    this.showWalletModal = true;
  }

  async deleteWallet(id: string) {
    const ok = await this.confirm('Hapus dompet', 'Dompet dan seluruh transaksinya akan dihapus. Lanjutkan?');
    if (!ok) return;
    this.finance.deleteWallet(id);
    if (this.editingWalletId === id) this.resetWalletForm();
    if (this.txWalletId === id) this.txWalletId = this.defaultWalletId();
    this.showWalletModal = false;
  }

  saveTransaction() {
    if (!this.txWalletId) return;
    const category = this.txCategory.trim();
    if (!category) return;
    const value = this.parseAmount(this.txValue);
    if (!value) return;
    const timestamp = this.buildTimestamp();

    const payload: Omit<Transaction, 'id'> & { id?: string } = {
      id: this.editingTxId ?? undefined,
      walletId: this.txWalletId,
      category,
      value,
      description: this.txDescription?.trim() || undefined,
      timestamp,
    };

    this.finance.upsertTransaction(payload);
    this.resetTxForm();
  }

  editTransaction(id: string) {
    const tx = this.finance.transactions().find((t) => t.id === id);
    if (!tx) return;
    this.editingTxId = id;
    this.txWalletId = tx.walletId;
    this.txCategory = tx.category;
    this.txValue = tx.value;
    this.txDescription = tx.description ?? '';
    this.txDate = tx.timestamp.slice(0, 10);
  }

  async deleteTransaction(id: string) {
    const ok = await this.confirm('Hapus transaksi', 'Transaksi ini akan dihapus. Lanjutkan?');
    if (!ok) return;
    this.finance.deleteTransaction(id);
    if (this.editingTxId === id) this.resetTxForm();
  }

  resetWalletForm() {
    this.editingWalletId = null;
    this.walletName = '';
    this.walletInitial = '0';
    this.walletStyleId = WALLET_STYLES[0].id;
    this.walletIcon = 'account_balance_wallet';
    this.showWalletModal = false;
  }

  resetTxForm() {
    this.editingTxId = null;
    this.txWalletId = this.defaultWalletId();
    this.txCategory = this.finance.categories()[0]?.name ?? '';
    this.txValue = '0';
    this.txDescription = '';
    this.txDate = this.today();
  }

  private defaultWalletId(): string {
    return this.finance.wallets()[0]?.id ?? '';
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private buildTimestamp(): string {
    const date = this.txDate || this.today();
    return `${date}T00:00`;
  }

  formatAmount(raw: string | number) {
    const num = this.parseAmount(raw);
    this.txValue = this.formatNumber(num);
  }

  private parseAmount(raw: string | number): number {
    const cleaned = String(raw ?? '').replace(/[^\d\-,.]/g, '');
    const normalized = cleaned.replace(/,/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  formatWalletAmount(raw: string | number) {
    const num = this.parseAmount(raw);
    this.walletInitial = this.formatNumber(num);
  }

  getStyle(styleId?: string): WalletStyle {
    return WALLET_STYLES.find((s) => s.id === styleId) ?? WALLET_STYLES[0];
  }

  private async confirm(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#e5e7eb',
      reverseButtons: true,
      customClass: {
        cancelButton: 'text-slate-700',
      },
    });
    return !!result.isConfirmed;
  }
}
