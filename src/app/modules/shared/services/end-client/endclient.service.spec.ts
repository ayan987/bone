import { TestBed } from '@angular/core/testing';

import { EndclientService } from './endclient.service';

describe('EndclientService', () => {
  let service: EndclientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndclientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
