import { TestBed } from '@angular/core/testing';

import { ConvertTextService } from './convert-text.service';

describe('ConvertTextService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvertTextService = TestBed.get(ConvertTextService);
    expect(service).toBeTruthy();
  });
});
