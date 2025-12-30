import { Routes } from '@angular/router';
import { Dashboard } from './page/dashboard/dashboard';
import { Projects } from './page/projects/projects';
import { TeamPage } from './page/team/team';
import { CalendarPage } from './page/calendar/calendar';
import { DocumentsPage } from './page/documents/documents';
import { ReportsPage } from './page/reports/reports';
import { FinancePage } from './page/finance/finance';
import { ProductivityPage } from './page/productivity/productivity';
import { TransactionsPage } from './page/transactions/transactions';
import { StuffPage } from './page/stuff/stuff';
import { CategoriesPage } from './page/categories/categories';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  { path: 'projects', component: Projects },
  { path: 'todo', component: TeamPage },
  { path: 'team', redirectTo: 'todo' },
  { path: 'finance', component: FinancePage },
  { path: 'productivity', component: ProductivityPage },
  { path: 'transactions', component: TransactionsPage },
  { path: 'categories', component: CategoriesPage },
  { path: 'stuff', component: StuffPage },
  { path: 'calendar', component: CalendarPage },
  { path: 'documents', component: DocumentsPage },
  { path: 'reports', component: ReportsPage },
  { path: '**', redirectTo: 'dashboard' },
];
