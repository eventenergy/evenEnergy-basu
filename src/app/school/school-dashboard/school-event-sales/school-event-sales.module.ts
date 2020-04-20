import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchoolEventSalesRoutingModule } from './school-event-sales-routing.module';
import { SchoolEventSalesComponent } from './school-event-sales/school-event-sales.component';

@NgModule({
  declarations: [SchoolEventSalesComponent],
  imports: [
    CommonModule,
    SchoolEventSalesRoutingModule
  ]
})
export class SchoolEventSalesModule { }
