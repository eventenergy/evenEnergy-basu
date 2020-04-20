import { Directive, ElementRef, Input, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import * as IntlTelInput from 'intl-tel-input';

@Directive({
  selector: '[appCreationEvent]'
})
export class CreationEventDirective implements OnInit {
  

  ngOnInit(): void {
    this.intlTelInput = IntlTelInput(this.el.nativeElement, {
      onlyCountries: ["in",],
      initialCountry: "in",
    });
    this.formControl.setValidators([Validators.required,this.mobileValidator(this.intlTelInput)])
    this.formControl.updateValueAndValidity();
  }
  
  @Input() formControl: FormControl; 
  @Output() countryCode = new EventEmitter<string>();
  intlTelInput: IntlTelInput.Plugin;

  constructor(public el : ElementRef) { }

  mobileValidator(intlTelInput: IntlTelInput.Plugin): ValidatorFn {
    return (control: AbstractControl):  {[key: string]: any} | null => {
      this.countryCode.emit(this.intlTelInput.getNumber());
      var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"]; 
      if(intlTelInput.isValidNumber()) return null;
      const errorCode = intlTelInput.getValidationError();
      return {"InvalidNumber": errorMap[errorCode]};
    } 
  }
}
