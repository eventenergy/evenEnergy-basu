import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainActivityComponent } from './main-activity.component';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../_guards';
import { MainNavbarModule } from '../../navbar/main-navbar/main-navbar.module';
import { ClickOutsideModule } from '../../_directives';
import { TimeAgoModule } from '../../_helpers/index';
import { PickerModule } from '@ctrl/ngx-emoji-mart'
// import 'hammerjs';
// import 'mousetrap';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { NgSelectModule } from '@ng-select/ng-select';
const routes: Routes = [
  {
    path: '',
    component: MainActivityComponent,
    canActivate: [AuthGuard],
    data: {
      permission:['PARENT','ADMIN','TEACHER', 'USER']
    },
    runGuardsAndResolvers: 'always',
  }
];

const MainActivityRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    MainActivityRouting,
    MainNavbarModule,
    FormsModule,
    ClickOutsideModule,
    TimeAgoModule,
    PickerModule,
    NgSelectModule,
    GalleryModule.forRoot(),
  ],
  declarations: [MainActivityComponent],
  exports:[MainActivityComponent]
})
export class MainActivityModule { }
