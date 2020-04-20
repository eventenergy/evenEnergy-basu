import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { StaticPageComponent } from './static-page/static-page.component';

const routes: Routes = [
    {path: '', component: HomePageComponent},
    {path: 'home/:static', component: StaticPageComponent},
    {path: 'login', loadChildren: './login-page/login-page.module#LoginPageModule'},
    {path: 'signup', loadChildren: './signup-page/signup-page.module#SignupPageModule'},
    {path: 'page-not-found', loadChildren: './page-not-found/page-not-found.module#PageNotFoundModule'},
    {path: 'user/forgot-password', loadChildren: './forgot-password/forgot-password.module#ForgotPasswordModule'},
    {path: 'user/forgot-password/reset', loadChildren: './reset-password/reset-password.module#ResetPasswordModule'},
    {path: 'email/child/invite', loadChildren:'./email-child-invite/email-child-invite.module#EmailChildInviteModule'},
    {path: 'login/mobile', loadChildren: './login-mobile-page/login-mobile-page.module#LoginMobilePageModule'},
    {path: 'privacy-policy', loadChildren: './privacy-policy-page/privacy-policy-page.module#PrivacyPolicyPageModule'},
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

export const HomeRoutingComponent = [HomePageComponent];
