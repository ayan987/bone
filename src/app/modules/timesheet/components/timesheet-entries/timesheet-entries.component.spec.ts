import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEntriesComponent } from './timesheet-entries.component';

describe('TimesheetEntriesComponent', () => {
  let component: TimesheetEntriesComponent;
  let fixture: ComponentFixture<TimesheetEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetEntriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
