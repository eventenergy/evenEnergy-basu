import { TestBed } from '@angular/core/testing';

import { TicketBookingService } from './ticket-booking.service';

describe('TicketBookingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TicketBookingService = TestBed.get(TicketBookingService);
    expect(service).toBeTruthy();
  });
});
