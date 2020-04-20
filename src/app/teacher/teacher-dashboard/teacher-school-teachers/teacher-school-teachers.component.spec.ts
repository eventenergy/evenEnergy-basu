import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSchoolTeachersComponent } from './teacher-school-teachers.component';

describe('TeacherSchoolTeachersComponent', () => {
  let component: TeacherSchoolTeachersComponent;
  let fixture: ComponentFixture<TeacherSchoolTeachersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherSchoolTeachersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSchoolTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
