import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetLabelsComponent } from './timesheet-labels.component';

describe('TimesheetLabelsComponent', () => {
  let component: TimesheetLabelsComponent;
  let fixture: ComponentFixture<TimesheetLabelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetLabelsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
