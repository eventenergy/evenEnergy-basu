import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SignupPageComponent } from './signup-page.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap';
import { FooterModule } from 'src/app/footer/footer.module';

const routes: Routes = [
  {path: '', component: SignupPageComponent}
]

const SignupRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SignupRouting,
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FooterModule
  ],
  exports: [SignupPageComponent],
  declarations: [SignupPageComponent]
})
export class SignupPageModule { }
