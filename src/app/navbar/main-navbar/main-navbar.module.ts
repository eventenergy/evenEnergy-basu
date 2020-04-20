import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavbarComponent } from './main-navbar.component';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RouterModule, Routes } from '@angular/router';
import { MenuSidebarComponent } from '../menu-sidebar/menu-sidebar.component';
import { ClickOutsideModule } from '../../_directives/index';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    ClickOutsideModule,
    NgSelectModule,
    RouterModule.forChild(routes)
  ],
  exports:[MainNavbarComponent, MenuSidebarComponent],
  declarations: [MainNavbarComponent, MenuSidebarComponent]
})
export class MainNavbarModule { }
