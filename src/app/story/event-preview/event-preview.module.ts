import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventPreviewComponent } from './event-preview.component';
import { AuthGuard } from '../../_guards';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';
import { AgmCoreModule } from '@agm/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap';

const routes: Routes = [
    {
      path: '',
      component: EventPreviewComponent,
      canActivate: [AuthGuard],
    data: {
      permission:['PARENT','ADMIN','TEACHER','USER']
    },
    }
  ];
  
  const EventPreviewRouting = RouterModule.forChild(routes);

  @NgModule({
    imports: [
      CommonModule,
      FormsModule,
      EventPreviewRouting,
      MainNavbarModule,
      BsDatepickerModule.forRoot(),
      AgmCoreModule.forRoot({
        // please get your own API key here:
        // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
        apiKey: 'AIzaSyALvHF1fgITwhk7a7ZbkHEfZQiDFwDb4nU',
        libraries: ['banglaore']      
      })
    ],
    declarations: [EventPreviewComponent]
  })
  export class EventPreviewModule { }