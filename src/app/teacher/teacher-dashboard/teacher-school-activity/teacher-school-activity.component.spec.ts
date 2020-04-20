import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSchoolActivityComponent } from './teacher-school-activity.component';

describe('TeacherSchoolActivityComponent', () => {
  let component: TeacherSchoolActivityComponent;
  let fixture: ComponentFixture<TeacherSchoolActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherSchoolActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSchoolActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
