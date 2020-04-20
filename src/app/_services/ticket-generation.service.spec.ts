import { TestBed } from '@angular/core/testing';

import { TicketGenerationService } from './ticket-generation.service';

describe('TicketGenerationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TicketGenerationService = TestBed.get(TicketGenerationService);
    expect(service).toBeTruthy();
  });
});
