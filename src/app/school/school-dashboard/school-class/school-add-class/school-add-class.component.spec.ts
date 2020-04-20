import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolAddClassComponent } from './school-add-class.component';

describe('SchoolAddClassComponent', () => {
  let component: SchoolAddClassComponent;
  let fixture: ComponentFixture<SchoolAddClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolAddClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolAddClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
