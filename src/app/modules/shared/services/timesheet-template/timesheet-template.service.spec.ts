import { TestBed } from '@angular/core/testing';

import { TimesheetTemplateService } from './timesheet-template.service';

describe('TimesheetTemplateService', () => {
  let service: TimesheetTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimesheetTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
