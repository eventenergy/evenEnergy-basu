import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';
import { CameraComponent } from './camera.component';

@NgModule({
  imports: [
    CommonModule,
    WebcamModule
  ],
  declarations: [CameraComponent],
  exports: [CameraComponent]
})
export class CameraModule { }
