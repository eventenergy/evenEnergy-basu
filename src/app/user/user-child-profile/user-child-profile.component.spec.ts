import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChildProfileComponent } from './user-child-profile.component';

describe('UserChildProfileComponent', () => {
  let component: UserChildProfileComponent;
  let fixture: ComponentFixture<UserChildProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserChildProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserChildProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
