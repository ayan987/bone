import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUnmatchedImportComponent } from './view-unmatched-import.component';

describe('ViewUnmatchedImportComponent', () => {
  let component: ViewUnmatchedImportComponent;
  let fixture: ComponentFixture<ViewUnmatchedImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewUnmatchedImportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewUnmatchedImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
