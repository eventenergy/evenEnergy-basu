import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThrowStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ConvertTextService {
  renderer: Renderer2;
  constructor(
    private sanitizer: DomSanitizer,
    private rendererFactory: RendererFactory2
    ) {
      this.renderer = this.rendererFactory.createRenderer(null, null);
     }

  getEventTitle(titleString: string){
    var div = this.renderer.createElement('div');
    this.renderer.setProperty(div, 'innerHTML', titleString);
    return div.innerText;
  }
  
}
