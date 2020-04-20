import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventUserPaymentRegistrationComponent } from './event-user-payment-registration.component';

describe('EventUserPaymentRegistrationComponent', () => {
  let component: EventUserPaymentRegistrationComponent;
  let fixture: ComponentFixture<EventUserPaymentRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventUserPaymentRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventUserPaymentRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
