import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ClientProjectService } from './client-project.service';
import { AssignedclientProject } from '../../../../models/assignedClientProjects';

describe('ClientProjectService', () => {
  let service: ClientProjectService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ClientProjectService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the list of associated client projects', () => {
    const mockResponse: AssignedclientProject[] = [
      // Mock response data here
    ];

    service.getAssociatedClientProject().subscribe((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(service.apiAssignedClientProject);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
