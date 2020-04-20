import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventTicketPaymentStatusComponent } from './event-ticket-payment-status.component';
import { NgxPrintModule } from 'ngx-print';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonDirectivesModule } from '../../_directives/common-directives.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { EventTicketCancellationComponent } from './event-ticket-cancellation/event-ticket-cancellation.component';

const routes: Routes = [
  {
    path: 'order/:id/payment/status',
    component: EventTicketPaymentStatusComponent,
    data: {assetType: "order"}
  },
  {
    path: 'ticket/:id/payment/status',
    component: EventTicketPaymentStatusComponent,
    data: {assetType: "ticket"}
  }
];
const EventUserPaymentRegistrationRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [EventTicketPaymentStatusComponent, EventTicketCancellationComponent],
  imports: [
    CommonModule,
    MainNavbarModule,
    FormsModule,
    ReactiveFormsModule,
    EventUserPaymentRegistrationRouting,
    NgxPrintModule,
    QRCodeModule,
    NgxBarcodeModule,
    CommonDirectivesModule,
    FooterModule
  ]
})
export class EventTicketPaymentStatusModule { }
