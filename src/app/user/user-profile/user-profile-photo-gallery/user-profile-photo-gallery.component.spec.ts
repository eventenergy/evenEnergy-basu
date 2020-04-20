import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfilePhotoGalleryComponent } from './user-profile-photo-gallery.component';

describe('UserProfilePhotoGalleryComponent', () => {
  let component: UserProfilePhotoGalleryComponent;
  let fixture: ComponentFixture<UserProfilePhotoGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfilePhotoGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfilePhotoGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
