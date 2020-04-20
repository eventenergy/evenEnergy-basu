import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassRoomTeacherComponent } from './class-room-teacher.component';

describe('ClassRoomTeacherComponent', () => {
  let component: ClassRoomTeacherComponent;
  let fixture: ComponentFixture<ClassRoomTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassRoomTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassRoomTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
