import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EmailChildInviteComponent } from './email-child-invite.component';

const routes: Routes = [
  {
      path: '',
      component: EmailChildInviteComponent
  }
];
const EmailChildInviteRouting = RouterModule.forChild(routes);



@NgModule({
  imports: [
    CommonModule,
    EmailChildInviteRouting
  ],
  declarations: [EmailChildInviteComponent]
})
export class EmailChildInviteModule { }
