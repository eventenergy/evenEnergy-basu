import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterStoriesComponent } from './filter-stories.component';

describe('FilterStoriesComponent', () => {
  let component: FilterStoriesComponent;
  let fixture: ComponentFixture<FilterStoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterStoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
