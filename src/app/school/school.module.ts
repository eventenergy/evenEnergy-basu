import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxPrintModule} from 'ngx-print';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';
import { SchoolRoutingModule, SchoolRoutingComponents } from './school-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MainNavbarModule } from '../navbar/main-navbar/main-navbar.module';
import { BsDropdownModule } from 'ngx-bootstrap';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { GenerateTicketComponent } from './school-dashboard/school-activity/generate-ticket/generate-ticket.component';
import { ImageCropModule } from '../_helpers/image-crop/image-crop.module';

@NgModule({
  imports: [
    CommonModule,
    SchoolRoutingModule,
    MainNavbarModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgxPrintModule,
    QRCodeModule,
    NgxBarcodeModule,
    ImageCropModule
  ],
  declarations: [SchoolRoutingComponents, GenerateTicketComponent]
})
export class SchoolModule { }
