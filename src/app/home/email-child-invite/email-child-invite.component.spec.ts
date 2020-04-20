import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailChildInviteComponent } from './email-child-invite.component';

describe('EmailChildInviteComponent', () => {
  let component: EmailChildInviteComponent;
  let fixture: ComponentFixture<EmailChildInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailChildInviteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailChildInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
