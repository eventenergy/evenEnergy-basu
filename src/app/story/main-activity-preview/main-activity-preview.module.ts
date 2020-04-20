import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { AuthGuard } from '../../_guards';
import { MainActivityPreviewComponent } from './main-activity-preview.component';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimeAgoModule } from '../../_helpers/index';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { AgmCoreModule } from '@agm/core';
import { ClickOutsideModule } from '../../_directives';
import { CustomRouteReuseStrategy } from 'src/app/_services/CustomRouteReuseStrategy';

const routes: Routes = [
  {
    path: '',
    component: MainActivityPreviewComponent,
    data: {reuseRoute: true, key: 'event-preview'}
    // canActivate: [AuthGuard],
    // data: {
    //   permission:['PARENT','ADMIN','TEACHER','USER']
    // },
  }
];

const MainActivityPreviewRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    MainActivityPreviewRouting,
    TimeAgoModule,
    GalleryModule.forRoot(),
    PickerModule,
    // MenuSidebarModule,
    ClickOutsideModule,
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'AIzaSyALvHF1fgITwhk7a7ZbkHEfZQiDFwDb4nU',
      libraries: ['bangalore']      
    })
  ],
  declarations: [MainActivityPreviewComponent],
})
export class MainActivityPreviewModule { }
