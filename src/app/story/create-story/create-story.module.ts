import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CreateStoryComponent } from './create-story.component';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../_guards';
import { CameraModule } from '../camera/camera.module';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { TimepickerModule } from 'ngx-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { OutsideClickDirective } from '../../_directives/outside-click.directive';
import { TinymceEditorDirective } from '../../_directives/tinymce-editor.directive';
import { CanDeactivateGuard } from 'src/app/_guards/can-deactivate.guard';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';

const routes: Routes = [
  {
    path: '',
    component: CreateStoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {
      permission:['PARENT','ADMIN','TEACHER']
    },
  }
];

const CreateStoryRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CameraModule,
    CreateStoryRouting,
    GooglePlaceModule,
    TimepickerModule.forRoot(),
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ReactiveFormsModule,
    MainNavbarModule,
  ],
  declarations: [
    CreateStoryComponent,
    TinymceEditorDirective,
    OutsideClickDirective
  ],
  exports:[CreateStoryComponent
  ]
})

export class CreateStoryModule { }
