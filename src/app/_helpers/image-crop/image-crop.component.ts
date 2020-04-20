import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AlertService } from 'src/app/_services/alert.service';
declare let $: any;
@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent implements OnInit, OnChanges {
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  
  @Input() imageFileEvent: any;
  @Output() croppedImageFile: EventEmitter<File> = new EventEmitter();
  @Output() cropperClosed: EventEmitter<boolean> = new EventEmitter();
  constructor(private alertService: AlertService) { }
  
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
      console.log('changes detected', changes);
      // this.alertService.showLoader();
  }

  ngOnInit() { }

  imageLoaded(){
    this.alertService.hideLoader();
    $('#cropper_modal').modal('show');
  }

  async cropImage() {
    var cropEvent = await this.imageCropper.crop();
    $('#cropper_modal').modal('hide');
    var imgFile = this.dataURLtoFile(cropEvent.base64, 'img.png');
    this.croppedImageFile.emit(imgFile);
    this.imageCropper.imageChangedEvent = null;
    this.cropperClosed.emit(true);
  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
