import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultUserAboutComponent } from './default-user-about.component';

describe('DefaultUserAboutComponent', () => {
  let component: DefaultUserAboutComponent;
  let fixture: ComponentFixture<DefaultUserAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultUserAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultUserAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
