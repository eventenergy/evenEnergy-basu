import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CreationEventDirective} from './creation-event.directive'

@NgModule({
  declarations: [CreationEventDirective],
  imports: [
    CommonModule
  ],
  exports:[CreationEventDirective]
})
export class CommonDirectivesModule { }
