import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from './time-ago.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [TimeAgoPipe],
  declarations: [TimeAgoPipe]
})
export class TimeAgoModule { }
