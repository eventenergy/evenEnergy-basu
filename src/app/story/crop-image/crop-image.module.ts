import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LyThemeModule, LY_THEME } from '@alyle/ui';
import { LyResizingCroppingImageModule } from '@alyle/ui/resizing-cropping-images';
import { LyButtonModule } from '@alyle/ui/button';
import { LyIconModule } from '@alyle/ui/icon';
import { LyTypographyModule } from '@alyle/ui/typography';

/** Import theme */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
import { CropImageComponent } from './crop-image.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LyThemeModule.setTheme('minima-light'), // or minima-light 
    LyResizingCroppingImageModule,
    LyButtonModule,
    LyIconModule,
    LyTypographyModule,
  ],
  providers: [
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    { provide: LY_THEME, useClass: MinimaDark, multi: true }
  ],
  exports: [CropImageComponent],
  declarations: [CropImageComponent],
})
export class CropImageModule { }
