import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from './project.service';
import { Project } from '../../../../models/project';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a project via the API', () => {
    const mockProject: Project = {
      id: '',
      projectName: 'New Project',
      projectDescription: '',
      abrufRequired: false,
      status: ''
    };

    service.createProject(mockProject).subscribe((response) => {
      expect(response.body).toEqual(mockProject);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(`${service.apiProject}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockProject);
  });

  it('should return an Observable<HttpResponse<Project[]>> when getting a project', () => {
    const mockResponse: Project[] = [
      {
        id: '123',
        projectName: 'Test Project',
        projectDescription: 'Test Description',
        abrufRequired: true,
        status: 'Active'
      }
    ];

    service.getProjects().subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(`${service.apiProject}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return an Observable<HttpResponse<Project[]>> when getting a project by id', () => {
    const mockProjectId = '123';
    const mockResponse: Project[] = [
      {
        id: '123',
        projectName: 'Test Project',
        projectDescription: 'Test Description',
        abrufRequired: true,
        status: 'Active'
      }
    ];

    service.getProjectById(mockProjectId).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(`${service.apiProject}/${mockProjectId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  //Update Service

  it('should send a PUT request to update a client', () => {
    const mockProjectId = '1';
    const mockProject: Project = {
      id: mockProjectId,
      projectName: 'Project',
      projectDescription: '',
      abrufRequired: false,
      status: 'DRAFT'
    };

    service.updateProject(mockProjectId, mockProject).subscribe((response) => {
      expect(response.body).toEqual(mockProject);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });
    const req = httpMock.expectOne(`${service.apiProject}/${mockProjectId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProject);
    req.flush(mockProject);
  });
});


