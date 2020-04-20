import { EmailChildInviteModule } from './email-child-invite.module';

describe('EmailChildInviteModule', () => {
  let emailChildInviteModule: EmailChildInviteModule;

  beforeEach(() => {
    emailChildInviteModule = new EmailChildInviteModule();
  });

  it('should create an instance', () => {
    expect(emailChildInviteModule).toBeTruthy();
  });
});
