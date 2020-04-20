import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSchoolClassComponent } from './teacher-school-class.component';

describe('TeacherSchoolClassComponent', () => {
  let component: TeacherSchoolClassComponent;
  let fixture: ComponentFixture<TeacherSchoolClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherSchoolClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSchoolClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
