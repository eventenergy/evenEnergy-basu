import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';

const routes: Routes = [
  {
      path: '',
      component: ForgotPasswordComponent
  }
];
const ForgotPasswordRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    ForgotPasswordRouting,
    FormsModule,
    FooterModule
  ],
  declarations: [ForgotPasswordComponent]
})
export class ForgotPasswordModule { }
