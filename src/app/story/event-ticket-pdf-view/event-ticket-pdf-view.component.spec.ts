import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTicketPdfViewComponent } from './event-ticket-pdf-view.component';

describe('EventTicketPdfViewComponent', () => {
  let component: EventTicketPdfViewComponent;
  let fixture: ComponentFixture<EventTicketPdfViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTicketPdfViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTicketPdfViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
