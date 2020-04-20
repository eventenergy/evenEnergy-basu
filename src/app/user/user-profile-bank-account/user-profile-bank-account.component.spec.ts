import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileBankAccountComponent } from './user-profile-bank-account.component';

describe('UserProfileBankAccountComponent', () => {
  let component: UserProfileBankAccountComponent;
  let fixture: ComponentFixture<UserProfileBankAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileBankAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
