import { Component } from '@angular/core';

@Component({
  selector: 'app-stuff',
  standalone: true,
  template: `
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-2">
      <p class="text-sm uppercase tracking-wide text-emerald-500 font-semibold">Stuff</p>
      <h1 class="text-2xl font-bold text-slate-900">Miscellaneous</h1>
      <p class="text-slate-600 text-sm">A spot for additional finance tools and notes.</p>
    </section>
  `,
})
export class StuffPage { }
