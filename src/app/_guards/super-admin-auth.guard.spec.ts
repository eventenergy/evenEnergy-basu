import { TestBed, async, inject } from '@angular/core/testing';

import { SuperAdminAuthGuard } from './super-admin-auth.guard';

describe('SuperAdminAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuperAdminAuthGuard]
    });
  });

  it('should ...', inject([SuperAdminAuthGuard], (guard: SuperAdminAuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
