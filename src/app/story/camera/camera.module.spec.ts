import { CameraModule } from './camera.module';

describe('CameraModule', () => {
  let cameraModule: CameraModule;

  beforeEach(() => {
    cameraModule = new CameraModule();
  });

  it('should create an instance', () => {
    expect(cameraModule).toBeTruthy();
  });
});
