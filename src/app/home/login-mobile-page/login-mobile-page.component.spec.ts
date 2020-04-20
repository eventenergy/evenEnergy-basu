import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginMobilePageComponent } from './login-mobile-page.component';

describe('LoginMobilePageComponent', () => {
  let component: LoginMobilePageComponent;
  let fixture: ComponentFixture<LoginMobilePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginMobilePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginMobilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
