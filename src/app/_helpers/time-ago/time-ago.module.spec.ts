import { TimeAgoModule } from './time-ago.module';

describe('TimeAgoModule', () => {
  let timeAgoModule: TimeAgoModule;

  beforeEach(() => {
    timeAgoModule = new TimeAgoModule();
  });

  it('should create an instance', () => {
    expect(timeAgoModule).toBeTruthy();
  });
});
