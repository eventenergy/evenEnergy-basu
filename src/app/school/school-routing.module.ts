import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchoolComponent } from './school.component';
import { SchoolDashboardComponent, SchoolActivityComponent, SchoolTeachersComponent, SchoolStudentsComponent, SchoolClassComponent, SchoolLearningTagsComponent, SchoolAdminComponent, SchoolAddClassComponent, SchoolAddStudentComponent, SchoolProfileComponent } from './school-dashboard';
import { AuthGuard } from '../_guards';
import { SchoolActivityApprovalComponent } from './school-activity-approval/school-activity-approval.component';
import { SchoolStudentProfileEditComponent } from './school-dashboard/school-students/school-student-profile-edit/school-student-profile-edit.component';
import { GenerateTicketComponent } from './school-dashboard/school-activity/generate-ticket/generate-ticket.component';

const routes: Routes = [
  {
    path:'', 
    canActivate: [AuthGuard],
    data: {
      permission:['ADMIN']
    },
    component: SchoolComponent,
    children: [
      { path: '',
        component: SchoolDashboardComponent, 
        children: [
          { path: '', redirectTo: 'activity', pathMatch: 'full'},
          { path: 'activity', component: SchoolActivityComponent },
          { path: 'activity/:event-id/sales', loadChildren:'./school-dashboard/school-event-sales/school-event-sales.module#SchoolEventSalesModule'},
          { path: 'member', component: SchoolTeachersComponent },
          { path: 'student', component: SchoolStudentsComponent },
          { path: 'class', component: SchoolClassComponent },
          { path: 'learning-tags', component: SchoolLearningTagsComponent },
          { path: 'admin', component: SchoolAdminComponent }
        ]
      },
      { path: 'profile/edit',component: SchoolProfileComponent},
      { path: 'generate-ticket/:eventId',component: GenerateTicketComponent},
      { path: 'class-room', component: SchoolAddClassComponent},
      { path: 'student/add', component: SchoolAddStudentComponent},
      { path: 'activity/approvals', component: SchoolActivityApprovalComponent},
      { path: 'class-room/profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      { path: 'student-profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      { path: 'student-profile/edit/:id', component: SchoolStudentProfileEditComponent},
      { path: 'member-profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      { path: 'admin-profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'}
    ],
  },
  {
    path:'activity/approvals/preview/:id', 
    canActivate: [AuthGuard],
    data: {
      permission:['ADMIN']
    },
    loadChildren: '../story/main-activity-preview/main-activity-preview.module#MainActivityPreviewModule',
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SchoolRoutingModule { }

export const SchoolRoutingComponents = [SchoolComponent, SchoolActivityComponent, SchoolTeachersComponent, 
    SchoolStudentsComponent,SchoolClassComponent,SchoolLearningTagsComponent,SchoolAdminComponent,
    SchoolProfileComponent,SchoolAddClassComponent, SchoolAddStudentComponent, 
    SchoolDashboardComponent, SchoolActivityApprovalComponent, SchoolStudentProfileEditComponent];