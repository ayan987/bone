import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckUnmatchedImportsComponent } from './check-unmatched-imports.component';

describe('CheckUnmatchedImportsComponent', () => {
  let component: CheckUnmatchedImportsComponent;
  let fixture: ComponentFixture<CheckUnmatchedImportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckUnmatchedImportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckUnmatchedImportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
