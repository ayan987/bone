import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmatchedImportsComponent } from './unmatched-imports.component';

describe('UnmatchedImportsComponent', () => {
  let component: UnmatchedImportsComponent;
  let fixture: ComponentFixture<UnmatchedImportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnmatchedImportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnmatchedImportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
