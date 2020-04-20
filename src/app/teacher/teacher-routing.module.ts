import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeacherComponent } from './teacher.component';
import { AuthGuard } from '../_guards';
import { TeacherDashboardComponent, TeacherSchoolActivityComponent, TeacherSchoolClassComponent, TeacherSchoolTeachersComponent, TeacherSchoolStudentComponent, TeacherSchoolLearningTagsComponent } from './teacher-dashboard';


const routes: Routes = [
  {
    path:'', 
    canActivate: [AuthGuard],
    data: {
      permission:['TEACHER']
    },
    component: TeacherComponent,
    children: [
      { path: '',
        component: TeacherDashboardComponent, 
        children: [
          { path: '', redirectTo: 'activity', pathMatch: 'full'},
          { path: 'activity', component: TeacherSchoolActivityComponent },
          // { path: 'class', component: TeacherSchoolClassComponent },
          // { path: 'member', component: TeacherSchoolTeachersComponent },
          // { path: 'student', component: TeacherSchoolStudentComponent },
          // { path: 'learning-tags', component: TeacherSchoolLearningTagsComponent},
        ]
      },
      { path: 'student-profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      {path: 'member-profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      { path: 'class-room/profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
    ],
  },
  {
    path: '**',
    redirectTo: 'page-not-found',
    pathMatch: 'full'
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TeacherRoutingModule { }

export const TeacherRoutingComponent = [TeacherComponent,TeacherDashboardComponent,TeacherSchoolActivityComponent,TeacherSchoolClassComponent,
  TeacherSchoolLearningTagsComponent, TeacherSchoolStudentComponent,TeacherSchoolTeachersComponent];
