import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './click-outside.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ClickOutsideDirective],
  declarations: [ClickOutsideDirective]
})
export class ClickOutsideModule { }
