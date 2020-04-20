import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { Routes, RouterModule } from '@angular/router';
import { FilterStoriesComponent } from './filter-stories/filter-stories.component';

const routes: Routes = [
  {
    path: "",
    component: SearchComponent,
  }
]

const SearchRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [SearchComponent, FilterStoriesComponent],
  imports: [
    CommonModule,
    SearchRouting
  ],
  exports: [SearchComponent, FilterStoriesComponent]
})
export class SearchModule { }
