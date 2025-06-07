/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TimesheetService } from './timesheet.service';

describe('Service: Timesheet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimesheetService]
    });
  });

  it('should ...', inject([TimesheetService], (service: TimesheetService) => {
    expect(service).toBeTruthy();
  }));
});
