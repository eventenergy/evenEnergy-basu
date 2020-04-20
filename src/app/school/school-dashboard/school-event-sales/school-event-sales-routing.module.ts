import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchoolEventSalesComponent } from './school-event-sales/school-event-sales.component';

const routes: Routes = [
  {path: '', component: SchoolEventSalesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolEventSalesRoutingModule { }
