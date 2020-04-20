import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DraftPendingStoryComponent } from './draft-pending-story.component';
import { AuthGuard } from '../../_guards';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const routes: Routes = [
  {
    path: '',
    component: DraftPendingStoryComponent,
    canActivate: [AuthGuard],
    data: {
      permission:['PARENT','ADMIN','TEACHER']
    },
  },
  {path : 'draft', component : DraftPendingStoryComponent, data : {some_data : 'draft'}},
  {path : 'pending', component : DraftPendingStoryComponent, data : {some_data : 'pending'}}
];

const DraftPendingStoryRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    MainNavbarModule,
    DraftPendingStoryRouting,
  ],
  declarations: [DraftPendingStoryComponent]
})
export class DraftPendingStoryModule { }
