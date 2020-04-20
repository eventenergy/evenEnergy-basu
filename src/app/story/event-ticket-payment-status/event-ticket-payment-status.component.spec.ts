import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTicketPaymentStatusComponent } from './event-ticket-payment-status.component';

describe('EventTicketPaymentStatusComponent', () => {
  let component: EventTicketPaymentStatusComponent;
  let fixture: ComponentFixture<EventTicketPaymentStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTicketPaymentStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTicketPaymentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
