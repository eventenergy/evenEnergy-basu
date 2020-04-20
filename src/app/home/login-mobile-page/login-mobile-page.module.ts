import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginMobilePageComponent } from './login-mobile-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FooterModule } from 'src/app/footer/footer.module';

const routes: Routes = [
  {
      path: '',
      component: LoginMobilePageComponent
  }
];
const LoginMobilePageRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [LoginMobilePageComponent],
  exports:[],
  imports: [
    CommonModule,
    LoginMobilePageRouting,
    FormsModule,
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FooterModule
  ]
})

export class LoginMobilePageModule { }
