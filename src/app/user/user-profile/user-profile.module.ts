import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../_guards/index';
import { Routes, RouterModule } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { UserProfilePhotoGalleryComponent } from './user-profile-photo-gallery/user-profile-photo-gallery.component';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CurrentTicketsComponent } from './current-tickets/current-tickets.component';
import { BankDetailsComponent } from './bank-details/bank-details.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
    data: {
      permission:['USER','PARENT','ADMIN','TEACHER']
    },
    children:[
      { path: '', redirectTo:'orders/current', pathMatch: 'full'},
      { path: 'orders', redirectTo:'orders/current', pathMatch: 'full'},
      { path: 'orders/:type', component: CurrentTicketsComponent, data: { noReuse: true, entityType: "order" }},
      { path: 'tickets/:type', component: CurrentTicketsComponent, data: { noReuse: true, entityType: "ticket" }},
      // { path: 'gallery', component: UserProfilePhotoGalleryComponent},
      { path: 'bank-details', component: BankDetailsComponent},
    ]
  }
];

const UserProfileRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    UserProfileRouting,
    GalleryModule.forRoot(),
  ],
  exports: [UserProfileComponent],
  declarations: [UserProfileComponent, UserProfilePhotoGalleryComponent,CurrentTicketsComponent, BankDetailsComponent]
})
export class UserProfileModule { }
