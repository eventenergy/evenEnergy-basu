import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';
import { Location } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { RestAPIService, AlertService } from '../_services';
import { DEFAULT_PROFILE_PICTURE_URL , AWS_DEFAULT_LINK } from '../config';
declare let $: any;

@Injectable()
export class HelperService {
  private unsubscribe$ = new Subject();
  private renderer: Renderer2;
  
  constructor(
    private location: Location,
    private restApiService: RestAPIService,
    private alertSevice: AlertService,
    private rendererFactory: RendererFactory2
  ) { this.renderer = rendererFactory.createRenderer(null, null); }

  /*
  * Function to close menu side bar
  */
  closeMenuIcon(){
    $('#navigation-menu').css('left', '-280px');
    $('#showMenu, #hideMenu').css('left', '0');
    $('#showMenu, #hideMenu').html('&#9776;&nbsp;Menu');
    $('#hideMenu').attr('id', 'showMenu');
  }

  /*
  * Function to return to particular location
  */
  goBack(){
    this.location.back();
  }

  /*
  * Function to validate File size
  */
  validateFileSize(size : number){
    if(size<5242880)
        return true;

        return false;
  }

  /*
  * Function to validate File type
  */
  validateFileExtension(name: String) {
    name = name.toLowerCase();
    var ext = name.substring(name.lastIndexOf('.') + 1);
    if(ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpeg') {
      return true;
    }else {
      return false;
    }
  }

  /*
  * Function to return snap id
  */
  // getSnapId({file_data, user_id, school_id},callback){
  //   if(file_data && file_data instanceof File && user_id){
  //     if(!this.validateFileExtension(file_data.name)){
  //       this.alertSevice.showNotification('Selected file format is not supported','error')
  //       return callback && callback(false);
  //     }
  //     if (!this.validateFileSize(file_data.size)) {
  //       this.alertSevice.showNotification('Selected file size is more','error')
  //       return callback && callback(false);
  //     }
  //     this.restApiService.pushSaveFileToStorage(file_data,'snap/upload', (response)=>{
  //       if(response && response.fileUrl && response.success){
  //         let snap_details = {
  //           "schoolId" :school_id,
  //           "userId" : user_id,
  //           "imgPath" : response.fileUrl,
  //           "type": 1,
  //         };
  //         this.restApiService.postAPI('snap/add',snap_details,(response)=>{
  //           if(response && response.id){
  //             return callback && callback(response.id);
  //           }
  //         });
  //       }
  //     });
  //   }else{
  //     this.alertSevice.showNotification('Something went wrong','error');
  //     return callback && callback(false);
  //   }
  // }

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrlHelper(event){
    if(event && event.target && event.target.src){
      event.target.src = DEFAULT_PROFILE_PICTURE_URL;
    }
  }

  //added by mari on 6/jul/2019
  validateUploadedFileExtension(name: String) {
    name = name.toLowerCase();
    var ext = name.substring(name.lastIndexOf('.') + 1);
    if(ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'pdf') {
      return true;
    }else {
      return false;
    }
  }
  getFileType(name: String) {
    name = name.toLowerCase();
    var ext = name.substring(name.lastIndexOf('.') + 1);
    if(ext.toLowerCase() == 'pdf'){
      return 0;
    }else if(ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpeg'){
      return 1;
    }
  }

  //new functions
  /*
    Use this funtion to download a file 
    @param {string} type - type of data to be saved.
    @param {string} dataString - the Base64 data-string.
    @param {string} [downloadName=''] - name for downloaded file 
  */

  saveBase64File(type: string, dataString: string, downloadName=''){
    var elem = this.renderer.createElement('a');
    this.renderer.setProperty(elem, "href", `data:${type};base64,${dataString}`);
    this.renderer.setProperty(elem, "download", downloadName? downloadName : "download");
    elem.click();
  }

  getEventTitle(titleString: string){
    var div = this.renderer.createElement('div');
    this.renderer.setProperty(div, 'innerHTML', titleString);
    return div.innerText;
  }

  /*
    returns the image url of the first image of a story
    @param {string} storyText - text field returned in the story object.
  */
  getFirstStoryImage(storyText: string){
    var elem = this.renderer.createElement('div');
    elem.innerHTML = storyText;
    var divList = elem.querySelectorAll('div');
    for (let index = 0; index < divList.length; index++) {
      //find the first div with name attr
      if(divList[index].getAttribute('name')=='image'){
        var imgElem = divList[index].querySelector('img');
        return AWS_DEFAULT_LINK + imgElem.getAttribute('data-src');
      }
    }
    return divList.length;
  }

  compress(file: File): Observable<any> {
    const width = 600; 
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return Observable.create(observer => {
      reader.onload = ev => {
        const img = new Image();
        img.src = (ev.target as any).result;
        (img.onload = () => {
          const elem = document.createElement('canvas'); // Use Angular's Renderer2 method
          const scaleFactor = width / img.width;
          elem.width = width;
          elem.height = img.height * scaleFactor;
          const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
          ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
          ctx.canvas.toBlob(
            blob => {
              observer.next(
                new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }),
              );
              observer.complete();
            },
            'image/jpeg',
            1,
          );
        }),
          (reader.onerror = error => observer.error(error));
      };
    });
  }
}
