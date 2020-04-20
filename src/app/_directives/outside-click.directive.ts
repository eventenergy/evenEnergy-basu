import { Directive, Output, HostListener, ElementRef, EventEmitter, Input } from '@angular/core';

@Directive({
 selector: '[appOutsideClick]'
})
export class OutsideClickDirective {
 constructor(private elementRef: ElementRef){  }

 @Output() clickedOutside: EventEmitter<any> = new EventEmitter()
 @HostListener('document:click', ['$event.target'])
 onClick(targetElement) {
   const clickedInside = this.elementRef.nativeElement.contains(targetElement); 
   if (!clickedInside) {
     // if(this.elementRef.nativeElement.style.display == 'block') this.elementRef.nativeElement.style.display = 'none';
     this.clickedOutside.emit(targetElement);
   }
 }
}
