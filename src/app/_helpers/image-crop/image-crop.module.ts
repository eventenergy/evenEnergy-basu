import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropComponent } from './image-crop.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [ImageCropComponent],
  imports: [
    CommonModule,
    ImageCropperModule
  ],
  exports: [ImageCropComponent]
})
export class ImageCropModule { }
