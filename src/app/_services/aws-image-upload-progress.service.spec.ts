import { TestBed } from '@angular/core/testing';

import { AwsImageUploadProgressService } from './aws-image-upload-progress.service';

describe('AwsImageUploadProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwsImageUploadProgressService = TestBed.get(AwsImageUploadProgressService);
    expect(service).toBeTruthy();
  });
});
