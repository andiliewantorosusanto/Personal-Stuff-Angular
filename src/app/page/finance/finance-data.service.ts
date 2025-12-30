import { Injectable, computed, signal } from '@angular/core';

export type WalletStyle = {
  id: string;
  bg: string;
  text: string;
  iconBg: string;
};

export type Wallet = {
  id: string;
  name: string;
  initial: number;
  createdAt: string;
  styleId?: string;
  icon?: string;
};

export type Transaction = {
  id: string;
  walletId: string;
  category: string;
  value: number;
  description?: string;
  timestamp: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

const WALLET_KEY = 'finance-wallets';
const TX_KEY = 'finance-transactions';
const CATEGORY_KEY = 'finance-categories';
export const WALLET_STYLES: WalletStyle[] = [
  { id: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  { id: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100' },
  { id: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  { id: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100' },
  { id: 'sky', bg: 'bg-sky-50', text: 'text-sky-700', iconBg: 'bg-sky-100' },
  { id: 'slate', bg: 'bg-slate-100', text: 'text-slate-800', iconBg: 'bg-white' },
];

@Injectable({ providedIn: 'root' })
export class FinanceDataService {
  private readonly defaultCategories: Category[] = [
    { id: 'salary', name: 'Salary', icon: 'savings' },
    { id: 'groceries', name: 'Groceries', icon: 'shopping_bag' },
    { id: 'transport', name: 'Transport', icon: 'commute' },
    { id: 'bills', name: 'Bills', icon: 'receipt_long' },
    { id: 'leisure', name: 'Leisure', icon: 'sports_esports' },
    { id: 'health', name: 'Health', icon: 'favorite' },
    { id: 'other', name: 'Uncategorized', icon: 'sell' },
  ];

  readonly walletStyles = WALLET_STYLES;
  readonly wallets = signal<Wallet[]>(this.normalizeWallets(this.load(WALLET_KEY, [])));
  readonly transactions = signal<Transaction[]>(this.load(TX_KEY, []));
  readonly categories = signal<Category[]>(this.normalizeCategories(this.load(CATEGORY_KEY, this.defaultCategories)));

  readonly walletBalances = computed(() => {
    const sums: Record<string, number> = {};
    this.transactions().forEach((tx) => {
      sums[tx.walletId] = (sums[tx.walletId] ?? 0) + tx.value;
    });
    return this.wallets().reduce<Record<string, number>>((acc, wallet) => {
      acc[wallet.id] = wallet.initial + (sums[wallet.id] ?? 0);
      return acc;
    }, {});
  });

  readonly transactionsByDay = computed(() => {
    const map: Record<string, { total: number; items: Transaction[] }> = {};
    for (const tx of this.sortedTransactions()) {
      const day = tx.timestamp.slice(0, 10);
      if (!map[day]) {
        map[day] = { total: 0, items: [] };
      }
      map[day].items.push(tx);
      map[day].total += tx.value;
    }
    return Object.entries(map)
      .map(([day, data]) => ({ day, ...data }))
      .sort((a, b) => b.day.localeCompare(a.day));
  });

  readonly transactionSeries = computed(() => {
    const grouped: Record<string, number> = {};
    this.transactions().forEach((tx) => {
      const day = tx.timestamp.slice(0, 10);
      grouped[day] = (grouped[day] ?? 0) + tx.value;
    });
    const sortedDays = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    if (!sortedDays.length) {
      return { labels: ['No data'], values: [0] };
    }
    let running = 0;
    const labels: string[] = [];
    const values: number[] = [];
    for (const day of sortedDays) {
      running += grouped[day];
      labels.push(day);
      values.push(running);
    }
    return { labels, values };
  });

  upsertWallet(data: { id?: string; name: string; initial: number; styleId?: string; icon?: string }) {
    const styleId = data.styleId || this.walletStyles[0].id;
    const icon = data.icon || 'account_balance_wallet';
    if (data.id) {
      this.wallets.update((list) =>
        list.map((w) =>
          w.id === data.id ? { ...w, name: data.name, initial: data.initial, styleId, icon } : w
        )
      );
    } else {
      const wallet: Wallet = {
        id: this.uid(),
        name: data.name,
        initial: data.initial,
        createdAt: new Date().toISOString(),
        styleId,
        icon,
      };
      this.wallets.update((list) => [wallet, ...list]);
    }
    this.persist(WALLET_KEY, this.wallets());
  }

  deleteWallet(id: string) {
    this.wallets.update((list) => list.filter((w) => w.id !== id));
    this.transactions.update((list) => list.filter((tx) => tx.walletId !== id));
    this.persist(WALLET_KEY, this.wallets());
    this.persist(TX_KEY, this.transactions());
  }

  upsertTransaction(data: {
    id?: string;
    walletId: string;
    category: string;
    value: number;
    description?: string;
    timestamp: string;
  }) {
    if (data.id) {
      this.transactions.update((list) =>
        list.map((tx) => (tx.id === data.id ? { ...tx, ...data } : tx))
      );
    } else {
      const tx: Transaction = {
        id: this.uid(),
        walletId: data.walletId,
        category: data.category,
        value: data.value,
        description: data.description?.trim() || undefined,
        timestamp: data.timestamp,
      };
      this.transactions.update((list) => [tx, ...list]);
    }
    this.persist(TX_KEY, this.transactions());
  }

  deleteTransaction(id: string) {
    this.transactions.update((list) => list.filter((tx) => tx.id !== id));
    this.persist(TX_KEY, this.transactions());
  }

  upsertCategory(data: { id?: string; name: string; icon?: string }) {
    const icon = data.icon || 'sell';
    if (data.id) {
      this.categories.update((list) =>
        list.map((cat) => (cat.id === data.id ? { ...cat, name: data.name, icon } : cat))
      );
    } else {
      const category: Category = {
        id: data.id ?? this.uid(),
        name: data.name,
        icon,
      };
      this.categories.update((list) => [category, ...list]);
    }
    this.persist(CATEGORY_KEY, this.categories());
  }

  deleteCategory(id: string) {
    const target = this.categories().find((c) => c.id === id);
    if (!target) return;
    const fallback = this.ensureFallbackCategory();
    if (target.id === fallback.id) return;

    this.categories.update((list) => list.filter((c) => c.id !== id));
    this.transactions.update((list) =>
      list.map((tx) => (tx.category === target.name ? { ...tx, category: fallback.name } : tx))
    );

    this.persist(CATEGORY_KEY, this.categories());
    this.persist(TX_KEY, this.transactions());
  }

  categoryIcon(name: string): string {
    return this.categories().find((c) => c.name === name)?.icon ?? 'sell';
  }

  walletLabel(walletId: string) {
    return this.wallets().find((w) => w.id === walletId)?.name ?? 'Unknown wallet';
  }

  sortedTransactions(): Transaction[] {
    return [...this.transactions()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private load<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private persist(key: string, value: unknown) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  private normalizeWallets(list: Wallet[]): Wallet[] {
    return list.map((wallet, idx) => {
      const styleId = wallet.styleId || this.walletStyles[idx % this.walletStyles.length].id;
      const icon = wallet.icon || 'account_balance_wallet';
      return { ...wallet, styleId, icon };
    });
  }

  private normalizeCategories(list: (Category | string)[]): Category[] {
    const normalized = list.map((c, idx) => {
      if (typeof c === 'string') {
        return {
          id: this.slug(c) || this.defaultCategories[idx % this.defaultCategories.length].id,
          name: c,
          icon: 'sell',
        };
      }
      return {
        id: c.id ?? this.defaultCategories[idx % this.defaultCategories.length].id,
        name: c.name,
        icon: c.icon || 'sell',
      };
    });
    const hasFallback = normalized.some((c) => c.name === 'Uncategorized');
    return hasFallback ? normalized : [...normalized, this.defaultCategories.find((c) => c.name === 'Uncategorized')!];
  }

  private ensureFallbackCategory(): Category {
    const existing = this.categories().find((c) => c.name === 'Uncategorized');
    if (existing) return existing;
    const fallback = this.defaultCategories.find((c) => c.name === 'Uncategorized')!;
    this.categories.update((list) => [...list, fallback]);
    this.persist(CATEGORY_KEY, this.categories());
    return fallback;
  }

  private uid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private slug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
