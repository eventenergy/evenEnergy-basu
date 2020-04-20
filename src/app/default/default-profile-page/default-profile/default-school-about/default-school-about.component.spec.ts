import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultSchoolAboutComponent } from './default-school-about.component';

describe('DefaultSchoolAboutComponent', () => {
  let component: DefaultSchoolAboutComponent;
  let fixture: ComponentFixture<DefaultSchoolAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultSchoolAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultSchoolAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
