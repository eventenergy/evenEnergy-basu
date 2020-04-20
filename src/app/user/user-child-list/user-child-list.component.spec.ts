import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChildListComponent } from './user-child-list.component';

describe('UserChildListComponent', () => {
  let component: UserChildListComponent;
  let fixture: ComponentFixture<UserChildListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserChildListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserChildListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
