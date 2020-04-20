import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta) { }

   updateTags(metaData: any){
     if(metaData.description) {
        this.meta.updateTag({name: 'description', content: metaData.description});
        this.meta.updateTag({property: "og:description", content: metaData.description})
      }
      if(metaData.title){
        this.meta.updateTag({property: 'og:title', content: metaData.title});
      }
     
   }
}
