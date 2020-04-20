import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTicketsComponent } from './current-tickets.component';

describe('CurrentTicketsComponent', () => {
  let component: CurrentTicketsComponent;
  let fixture: ComponentFixture<CurrentTicketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentTicketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
