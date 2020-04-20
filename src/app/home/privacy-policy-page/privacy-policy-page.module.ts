import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyPolicyPageComponent } from './privacy-policy-page.component';

const routes: Routes = [
  {path: '', component: PrivacyPolicyPageComponent}
]

const PrivacyPolicyRotuing = RouterModule.forChild(routes);

@NgModule({
  declarations: [PrivacyPolicyPageComponent],
  imports: [
    CommonModule,
    PrivacyPolicyRotuing
  ]
})
export class PrivacyPolicyPageModule { }
