import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  template: `
    <div class="space-y-2 text-slate-800">
      <h2 class="text-xl font-semibold">{{ pageTitle }}</h2>
      <p class="text-slate-600">This section is coming soon.</p>
    </div>
  `,
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  readonly pageTitle = this.route.snapshot.data['title'] ?? 'Page';
}
