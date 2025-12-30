import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FinanceDataService, Category } from '../finance/finance-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './categories.html',
})
export class CategoriesPage {
  name = '';
  icon = 'label';
  editingId: string | null = null;
  iconOptions = ['label', 'shopping_bag', 'receipt_long', 'commute', 'restaurant', 'attach_money'];

  constructor(protected finance: FinanceDataService) {}

  get categories() {
    return this.finance.categories();
  }

  save() {
    const name = this.name.trim();
    if (!name) return;
    this.finance.upsertCategory({ id: this.editingId ?? undefined, name, icon: this.icon || 'label' });
    this.reset();
  }

  edit(id: string) {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return;
    this.editingId = id;
    this.name = cat.name;
    this.icon = cat.icon;
  }

  async remove(id: string) {
    const ok = await Swal.fire({
      title: 'Hapus kategori',
      text: 'Transaksi dengan kategori ini akan dipindah ke "Uncategorized". Lanjutkan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    this.finance.deleteCategory(id);
    if (this.editingId === id) this.reset();
  }

  reset() {
    this.editingId = null;
    this.name = '';
    this.icon = 'label';
  }
}
