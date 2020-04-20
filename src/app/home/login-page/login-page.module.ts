import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';

const routes: Routes = [
  {
      path: '',
      component: LoginPageComponent
  }
];
const LoginPageRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    LoginPageRouting,
    FormsModule,
    FooterModule
  ],
  declarations: [LoginPageComponent]
})
export class LoginPageModule { }
