import { TestBed } from '@angular/core/testing';

import { TimesheetLabelsService } from './timesheet-labels.service';

describe('TimesheetLabelsService', () => {
  let service: TimesheetLabelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimesheetLabelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
