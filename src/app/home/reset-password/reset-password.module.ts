import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordComponent
  }
];
const ResetPasswordRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    ResetPasswordRouting,
    FormsModule,
    FooterModule
  ],
  declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule { }

