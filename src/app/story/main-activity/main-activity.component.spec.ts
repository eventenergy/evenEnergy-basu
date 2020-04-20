import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainActivityComponent } from './main-activity.component';

describe('MainActivityComponent', () => {
  let component: MainActivityComponent;
  let fixture: ComponentFixture<MainActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
