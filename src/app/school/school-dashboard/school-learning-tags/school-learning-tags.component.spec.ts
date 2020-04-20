import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolLearningTagsComponent } from './school-learning-tags.component';

describe('SchoolLearningTagsComponent', () => {
  let component: SchoolLearningTagsComponent;
  let fixture: ComponentFixture<SchoolLearningTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolLearningTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolLearningTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
