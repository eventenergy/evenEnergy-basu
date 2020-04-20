import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassRoomStudentComponent } from './class-room-student.component';

describe('ClassRoomStudentComponent', () => {
  let component: ClassRoomStudentComponent;
  let fixture: ComponentFixture<ClassRoomStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassRoomStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassRoomStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
