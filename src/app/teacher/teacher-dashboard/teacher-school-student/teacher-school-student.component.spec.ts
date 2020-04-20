import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSchoolStudentComponent } from './teacher-school-student.component';

describe('TeacherSchoolStudentComponent', () => {
  let component: TeacherSchoolStudentComponent;
  let fixture: ComponentFixture<TeacherSchoolStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherSchoolStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSchoolStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
