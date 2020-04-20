import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTicketCancellationComponent } from './event-ticket-cancellation.component';

describe('EventTicketCancellationComponent', () => {
  let component: EventTicketCancellationComponent;
  let fixture: ComponentFixture<EventTicketCancellationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTicketCancellationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTicketCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
