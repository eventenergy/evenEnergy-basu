import { CropImageModule } from './crop-image.module';

describe('CropImageModule', () => {
  let cropImageModule: CropImageModule;

  beforeEach(() => {
    cropImageModule = new CropImageModule();
  });

  it('should create an instance', () => {
    expect(cropImageModule).toBeTruthy();
  });
});
