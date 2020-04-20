import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAddChildComponent } from './user-add-child/user-add-child.component';
import { UserChildListComponent } from './user-child-list/user-child-list.component';
import { AuthGuard } from '../_guards/auth.guard';
import { UserInvitesComponent } from './user-invites/user-invites.component';
import { UserComponent } from './user.component';
import { UserChangePasswordComponent } from './user-change-password/user-change-password.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { MainNavbarModule } from '../navbar/main-navbar/main-navbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
// import { UserAddBankDetailsComponent } from './user-add-bank-details/user-add-bank-details.component';
import { UserProfileBankAccountComponent } from './user-profile-bank-account/user-profile-bank-account.component'
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropModule } from '../_helpers/image-crop/image-crop.module';

const routes: Routes = [
  {
    path:'',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: {
      permission:['USER','PARENT','ADMIN','TEACHER']
    },
    children:[
      { path: '', redirectTo:'profile', pathMatch: 'full'},
      // { path: 'profile', loadChildren: () => import('./user-profile/user-profile.module#UserProfileModule').then(m => m.UserProfileModule)},
      { path: 'profile', loadChildren: './user-profile/user-profile.module#UserProfileModule'},
      { path: 'profile/edit', component: UserProfileEditComponent},
      { path: 'profile/account', component: UserProfileBankAccountComponent},
      { path: 'invites', component: UserInvitesComponent},
      { path: 'child/add', component: UserAddChildComponent},
      { path: 'child/list', component: UserChildListComponent},
      { path: 'child/profile', loadChildren:'./user-child-profile/user-child-profile.module#UserChildProfileModule'},
      { path: 'change-password', component: UserChangePasswordComponent},
      { path: 'organization/profile', loadChildren:'../default/default-profile-page/default-profile-page.module#DefaultProfilePageModule'},
      // { path: 'bank-detalis', component: UserAddBankDetailsComponent},
    ]
  },
  {
    path: '**',
    redirectTo: 'page-not-found',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    MainNavbarModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ImageCropperModule,
    ImageCropModule
  ],
  exports: [],
  declarations: [
    UserComponent, UserAddChildComponent,
    UserChildListComponent, UserInvitesComponent, UserChangePasswordComponent, UserProfileBankAccountComponent, UserProfileEditComponent
  ]
})

export class UserRoutingModule { }