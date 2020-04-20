import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/_guards';
import { DefaultProfilePageComponent } from './default-profile-page.component';
import { DefaultProfileComponent } from './default-profile/default-profile.component';
import { MainNavbarModule } from 'src/app/navbar/main-navbar/main-navbar.module';
import { CommonModule } from '@angular/common';
import { ClassRoomTeacherComponent } from './default-profile/class-room-teacher/class-room-teacher.component';
import { ClassRoomStudentComponent } from './default-profile/class-room-student/class-room-student.component';
import { TeacherUndertakingClassComponent } from './default-profile/teacher-undertaking-class/teacher-undertaking-class.component';
import { DefaultUserAboutComponent } from './default-profile/default-user-about/default-user-about.component';
import { StudentParentComponent } from './default-profile/student-parent/student-parent.component';
import { StudentClassComponent } from './default-profile/student-class/student-class.component';
import { DefaultSchoolAboutComponent } from './default-profile/default-school-about/default-school-about.component';

const routes: Routes = [
  {
    path:'', 
    canActivate: [AuthGuard],
    data: {
      permission:['ADMIN', 'TEACHER', 'PARENT']
    },
    component: DefaultProfilePageComponent,
    children: [
      {
        path: '',
        component: DefaultProfileComponent
      }
    ],
  }   
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MainNavbarModule,
  ],
  exports: [RouterModule],
  declarations: [DefaultProfilePageComponent,DefaultProfileComponent,ClassRoomTeacherComponent, 
                ClassRoomStudentComponent, TeacherUndertakingClassComponent,DefaultUserAboutComponent,
                StudentParentComponent, StudentClassComponent, DefaultSchoolAboutComponent]
})
export class DefaultProfilePageRoutingModule { }
