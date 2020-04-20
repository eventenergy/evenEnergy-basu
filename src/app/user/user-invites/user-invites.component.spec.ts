import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInvitesComponent } from './user-invites.component';

describe('UserInvitesComponent', () => {
  let component: UserInvitesComponent;
  let fixture: ComponentFixture<UserInvitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserInvitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInvitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
