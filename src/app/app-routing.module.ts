import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from './_guards/can-deactivate.guard';

const routes: Routes = [
  { path: '', loadChildren: './home/home.module#HomeModule'},
  { path: 'search', loadChildren: './search/search.module#SearchModule'},
  { path: 'user', loadChildren: './user/user.module#UserModule'},
  // { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
  { path: 'admin/organization', loadChildren: './school/school.module#SchoolModule'},
  { path: 'activity', loadChildren:'./story/main-activity/main-activity.module#MainActivityModule'},
  { path: 'activity/preview/:id', loadChildren:'./story/main-activity-preview/main-activity-preview.module#MainActivityPreviewModule'},
  { path: 'member/organization', loadChildren: './teacher/teacher.module#TeacherModule'},
  { path: 'story/create/new', loadChildren: './story/create-story/create-story.module#CreateStoryModule'},
  { path: 'story/edit/:id', loadChildren: './story/create-story/create-story.module#CreateStoryModule'},
  { path: 'stories/:type', loadChildren: './story/draft-pending-story/draft-pending-story.module#DraftPendingStoryModule'},
  { path: 'event/preview/:id', loadChildren: './story/event-preview/event-preview.module#EventPreviewModule'},
  { path: 'super-admin', loadChildren: './super-admin/super-admin.module#SuperAdminModule'},
  { path: 'event/payment-registration/:id', loadChildren: './story/event-user-payment-registration/event-user-payment-registration.module#EventUserPaymentRegistrationModule'},
  { path: 'asset', loadChildren: './story/event-ticket-payment-status/event-ticket-payment-status.module#EventTicketPaymentStatusModule'},
  {
    path: '**',
    redirectTo: 'page-not-found',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }