import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetRegenerationResultDialogComponent } from './timesheet-regeneration-result-dialog.component';

describe('TimesheetRegenerationResultDialogComponent', () => {
  let component: TimesheetRegenerationResultDialogComponent;
  let fixture: ComponentFixture<TimesheetRegenerationResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetRegenerationResultDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetRegenerationResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
