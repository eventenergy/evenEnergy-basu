import { TestBed } from '@angular/core/testing';

import { AwsImageUploadService } from './aws-image-upload.service';

describe('AwsImageUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwsImageUploadService = TestBed.get(AwsImageUploadService);
    expect(service).toBeTruthy();
  });
});
