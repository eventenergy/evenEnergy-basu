import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChildSchoolComponent } from './user-child-school.component';

describe('UserChildSchoolComponent', () => {
  let component: UserChildSchoolComponent;
  let fixture: ComponentFixture<UserChildSchoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserChildSchoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserChildSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
