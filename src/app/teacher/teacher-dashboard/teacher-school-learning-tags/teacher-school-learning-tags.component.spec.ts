import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSchoolLearningTagsComponent } from './teacher-school-learning-tags.component';

describe('TeacherSchoolLearningTagsComponent', () => {
  let component: TeacherSchoolLearningTagsComponent;
  let fixture: ComponentFixture<TeacherSchoolLearningTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherSchoolLearningTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherSchoolLearningTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
