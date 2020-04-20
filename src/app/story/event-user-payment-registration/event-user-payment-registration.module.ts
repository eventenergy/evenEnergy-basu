import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from '../../_directives';
import { RouterModule, Routes } from '@angular/router';
import { EventUserPaymentRegistrationComponent } from './event-user-payment-registration.component';
import { AuthGuard } from '../../_guards';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';
import { CanDeactivateGuard } from 'src/app/_guards/can-deactivate.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonDirectivesModule } from '../../_directives/common-directives.module';


const routes: Routes = [
  {
    path: '',
    component: EventUserPaymentRegistrationComponent,
    canDeactivate: [CanDeactivateGuard],
  }
];
const EventUserPaymentRegistrationRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [EventUserPaymentRegistrationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainNavbarModule,
    ClickOutsideModule,
    EventUserPaymentRegistrationRouting,
    CommonDirectivesModule
  ]
})
export class EventUserPaymentRegistrationModule { }
