import { TestBed } from '@angular/core/testing';

import { ActiveConsultantService } from './active-consultant.service';

describe('ActiveConsultantService', () => {
  let service: ActiveConsultantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveConsultantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
