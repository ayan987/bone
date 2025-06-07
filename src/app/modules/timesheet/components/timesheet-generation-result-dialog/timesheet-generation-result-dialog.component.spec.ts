import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetGenerationResultDialogComponent } from './timesheet-generation-result-dialog.component';

describe('TimesheetGenerationResultDialogComponent', () => {
  let component: TimesheetGenerationResultDialogComponent;
  let fixture: ComponentFixture<TimesheetGenerationResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetGenerationResultDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetGenerationResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
