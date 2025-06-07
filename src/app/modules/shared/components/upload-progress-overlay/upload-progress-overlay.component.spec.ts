import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProgressOverlayComponent } from './upload-progress-overlay.component';

describe('UploadProgressOverlayComponent', () => {
  let component: UploadProgressOverlayComponent;
  let fixture: ComponentFixture<UploadProgressOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadProgressOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadProgressOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
