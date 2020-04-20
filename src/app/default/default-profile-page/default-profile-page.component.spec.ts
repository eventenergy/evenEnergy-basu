import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultProfilePageComponent } from './default-profile-page.component';

describe('DefaultProfilePageComponent', () => {
  let component: DefaultProfilePageComponent;
  let fixture: ComponentFixture<DefaultProfilePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultProfilePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
