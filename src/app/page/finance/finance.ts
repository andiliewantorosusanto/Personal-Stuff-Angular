import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FinanceDataService } from './finance-data.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './finance.html',
})
export class FinancePage {
  protected finance = inject(FinanceDataService);

  protected readonly totalBalance = computed(() =>
    Object.values(this.finance.walletBalances()).reduce((sum, v) => sum + v, 0)
  );
  protected readonly walletCount = computed(() => this.finance.wallets().length);
  protected readonly transactionCount = computed(() => this.finance.transactions().length);
  protected readonly latestNetChange = computed(() => {
    const series = this.finance.transactionSeries();
    if (!series.values.length) return 0;
    return series.values[series.values.length - 1];
  });

  protected readonly transactionsByDay = computed(() => this.finance.transactionsByDay());
  protected readonly transactionSeries = computed(() => this.finance.transactionSeries());

  protected get assetLineData(): ChartData<'line'> {
    const series = this.transactionSeries();
    return {
      labels: series.labels,
      datasets: [
        {
          label: 'Perubahan bersih',
          data: series.values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  }

  protected readonly assetLineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false, mode: 'index' },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569' } },
      y: {
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#475569',
          callback: (value) => `Rp${Number(value).toLocaleString('en-US')}`,
        },
      },
    },
    elements: { line: { borderWidth: 3 } },
  };
}
