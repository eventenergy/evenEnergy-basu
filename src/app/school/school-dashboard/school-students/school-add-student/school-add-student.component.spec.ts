import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolAddStudentComponent } from './school-add-student.component';

describe('SchoolAddStudentComponent', () => {
  let component: SchoolAddStudentComponent;
  let fixture: ComponentFixture<SchoolAddStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolAddStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolAddStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
