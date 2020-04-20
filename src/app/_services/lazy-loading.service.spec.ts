import { TestBed } from '@angular/core/testing';

import { LazyLoadingService } from './lazy-loading.service';

describe('LazyLoadingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LazyLoadingService = TestBed.get(LazyLoadingService);
    expect(service).toBeTruthy();
  });
});
