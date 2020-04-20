import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule, TeacherRoutingComponent } from './teacher-routing.module';
import { MainNavbarModule } from '../navbar/main-navbar/main-navbar.module';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


@NgModule({
  imports: [
    CommonModule,
    TeacherRoutingModule,
    MainNavbarModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
  ],
  declarations: [TeacherRoutingComponent]
})
export class TeacherModule { }
