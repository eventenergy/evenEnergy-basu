import { Component, ViewChild, ChangeDetectionStrategy, Inject } from '@angular/core';
import { LyTheme2 } from '@alyle/ui';
import { LyResizingCroppingImages, ImgCropperConfig, ImgCropperEvent } from '@alyle/ui/resizing-cropping-images';

import { styles } from './crop-image.styles';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  // styleUrls: ['./crop-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CropImageComponent  {
  classes = this.theme.addStyleSheet(styles);
  croppedImg: string;
  @ViewChild(LyResizingCroppingImages) imgCropper: LyResizingCroppingImages;
  scale: number;
  myConfig: ImgCropperConfig = {
    width: 300,
    height: 300,
    fill: '#ff2997',
  };

  constructor(
    @Inject(LyTheme2) private theme: LyTheme2
  ) {
   }

  /** on event */
  onCrop(e: ImgCropperEvent) {
    this.croppedImg = e.dataURL;
  }
  /** manual crop */
  getCroppedImg() {
    const img = this.imgCropper.crop();
    return img.dataURL;
  }
}


