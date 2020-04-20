import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RestAPIService, AuthenticationService, NavbarService, DataService, AlertService } from './_services';
import { AuthGuard } from './_guards';
import { HelperService } from './_helpers';
import { AlertComponent } from './_directives';
import { AppRoutingModule } from './app-routing.module';
import { CropImageModule } from './story/crop-image/crop-image.module';
import 'hammerjs';
import 'mousetrap';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPrintModule } from 'ngx-print';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';
import { EventTicketPdfViewComponent } from './story/event-ticket-pdf-view/event-ticket-pdf-view.component';
import { CustomRouteReuseStrategy } from './_services/CustomRouteReuseStrategy';
import { RouteReuseStrategy } from '@angular/router';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { AddHeader } from './_helpers/addHeader';
import { ErrorInterceptor } from './_helpers/error.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgSelectModule,
    AppRoutingModule,
    HttpClientModule,
    CropImageModule,
    BsDatepickerModule.forRoot(),
    GalleryModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    NgxPrintModule,
    QRCodeModule,
    NgxBarcodeModule
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    EventTicketPdfViewComponent,
  ],
  exports: [],
  bootstrap: [AppComponent],
  providers: [AlertService, RestAPIService, AuthGuard, AuthenticationService, NavbarService, DataService, HelperService, CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddHeader,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

  ]
})
export class AppModule {

}

