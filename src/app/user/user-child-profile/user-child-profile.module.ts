import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/_guards';
import { UserChildProfileComponent } from './user-child-profile.component';
import { UserChildSchoolComponent } from './user-child-school/user-child-school.component';

const routes: Routes = [
  {
    path: '',
    component: UserChildProfileComponent,
    canActivate: [AuthGuard],
    data: {
      permission:['USER','PARENT','ADMIN','TEACHER']
    }
  }
];

const UserChildProfileRouting = RouterModule.forChild(routes);


@NgModule({
  declarations: [UserChildProfileComponent, UserChildSchoolComponent],
  exports: [],
  imports: [
    CommonModule,
    UserChildProfileRouting
  ]
})
export class UserChildProfileModule { }
