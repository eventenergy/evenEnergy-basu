import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AwsImageUploadProgressService {

  private upload_progres = new BehaviorSubject<Array<[]>>([]);
  private upload_progress_array = new Array();
 
  constructor() { }

  /* 
  * Function to get All upload progress array
  */
  getUploadProgressItems() {
    return this.upload_progres.asObservable();
  }

  /* 
  * Function to Add upload progress Item
  */
  addUploadProgressItem({count, key, percentage }) {
    var checked_index_value= this.upload_progress_array.findIndex(obj => obj.key == key && obj.count == count);
    if(checked_index_value>-1){
      this.upload_progress_array.splice(checked_index_value, 1);
      this.upload_progress_array.push({count:count, key: key, percentage: percentage});
    }else{
      this.upload_progress_array.push({count:count,key: key, percentage: percentage});
    }
    this.upload_progres.next(this.upload_progress_array);
  }

  /* 
  * Function to remove upload progress Item
  */
  removeUploadProgressItem({ key }) {
    this.upload_progress_array.forEach((link, index) => {
      if (link.key === key) {
        this.upload_progress_array.splice(index, 1);
      }
    });
  }
  
}
