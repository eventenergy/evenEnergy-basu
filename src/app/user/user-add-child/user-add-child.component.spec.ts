import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddChildComponent } from './user-add-child.component';

describe('UserAddChildComponent', () => {
  let component: UserAddChildComponent;
  let fixture: ComponentFixture<UserAddChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAddChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAddChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
