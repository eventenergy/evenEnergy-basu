import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftPendingStoryComponent } from './draft-pending-story.component';

describe('DraftPendingStoryComponent', () => {
  let component: DraftPendingStoryComponent;
  let fixture: ComponentFixture<DraftPendingStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftPendingStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftPendingStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
