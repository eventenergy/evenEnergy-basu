import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainActivityPreviewComponent } from './main-activity-preview.component';

describe('MainActivityPreviewComponent', () => {
  let component: MainActivityPreviewComponent;
  let fixture: ComponentFixture<MainActivityPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainActivityPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainActivityPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
