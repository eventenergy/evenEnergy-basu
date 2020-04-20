import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminEventApprovalsComponent } from './super-admin-event-approvals/super-admin-event-approvals.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards';
import { MainNavbarModule } from '../navbar/main-navbar/main-navbar.module';
import { SuperAdminAuthGuard } from '../_guards/super-admin-auth.guard';
import { SuperAdminPastApprovalsComponent } from './super-admin-past-approvals/super-admin-past-approvals.component';
import { SuperAdminOrganizationApprovalsComponent } from './super-admin-organization-approvals/super-admin-organization-approvals.component';
import { SuperAdminApprovalsComponent } from './super-admin-approvals/super-admin-approvals.component';
import { SuperAdminOrganizationDetailApprovalComponent } from './super-admin-organization-detail-approval/super-admin-organization-detail-approval.component';

const routes: Routes = [
  {
  path: 'approvals',
    canActivate: [AuthGuard, SuperAdminAuthGuard],
    data: {
      permission: ['PARENT', 'ADMIN', 'TEACHER', 'USER']
    },
    runGuardsAndResolvers: 'always',
    component: SuperAdminApprovalsComponent,
    children: [
      {
        path: 'events',
        component: SuperAdminEventApprovalsComponent
      },
      {
        path: 'organizations',
        component: SuperAdminOrganizationApprovalsComponent
      },
      {
        path: 'organizations/:orgId',
        component: SuperAdminOrganizationDetailApprovalComponent
      },
      {
        path: '',
        redirectTo: 'events',
      },
    ]
  },
  {
    path: 'past-approvals',
    component: SuperAdminPastApprovalsComponent,
    canActivate: [AuthGuard, SuperAdminAuthGuard],
    data: {
      permission: ['PARENT', 'ADMIN', 'TEACHER', 'USER']
    },
    runGuardsAndResolvers: 'always',
  }
];

const SuperUserRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [SuperAdminApprovalsComponent, SuperAdminEventApprovalsComponent, SuperAdminPastApprovalsComponent, SuperAdminOrganizationApprovalsComponent, SuperAdminOrganizationDetailApprovalComponent],
  imports: [
    CommonModule,
    SuperUserRouting,
    MainNavbarModule
  ]
})
export class SuperAdminModule { }
