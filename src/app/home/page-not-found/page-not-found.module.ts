import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
  {
      path: '',
      component: PageNotFoundComponent
  }
];
const PageNotFoundRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    PageNotFoundRouting
  ],
  declarations: [PageNotFoundComponent]
})
export class PageNotFoundModule { }
