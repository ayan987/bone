import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AbrufService } from './abruf.service';
import { HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

describe('AbrufService', () => {
  let service: AbrufService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AbrufService],
    });
    service = TestBed.inject(AbrufService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an Abruf', () => {
  const pcaId = '123';
  const abrufData = {
    id: "c258703338c14e909230ee8d38170d4d",
    projectId: "406ad197137f4da1b40117823e0ef135",
    clientId: "9a4ce70542e24a01bb0776adb3c395a2",
    abrufs: [
      {
        id: "",
        abrufName: "AbrufNAme",
        abrufNo: "Abruf-001-002-003",
        startDate: "01.08.2024",
        endDate: "17.08.2024",
        status: "ACTIVE"
      }
    ],
    status: "ACTIVE"
  };

  const mockResponse = {
    ...abrufData,
    id: "generated-unique-id"  // Assuming the backend generates an ID upon creation
  };

  service.createAbruf(pcaId, abrufData).subscribe((response) => {
    expect(response.status).toBe(201);  // Assuming a successful creation returns 201 Created
    // expect(response.body).toEqual(mockResponse);
  });

  const req = httpMock.expectOne(`${environment.abrufServiceUrl}/${pcaId}`);
  expect(req.request.method).toBe('PUT');
  req.flush(mockResponse, { status: 201, statusText: 'Created' });
});

  it('should update an Abruf', () => {
    const abrufId = '123';
    const abrufData = { /* provide test data here */ };
    const mockResponse = { /* mock response data */ };

    service.updateAbruf(abrufId, abrufData).subscribe((response) => {
      expect(response.status).toBe(200); // Adjust expected status code based on API behavior
      // expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.abrufEditServiceUrl}/${abrufId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('should get an Abruf by ID', () => {
    const pcaId = '123';
    const abrufId = '456';
    const mockResponse = { /* mock response data */ };

    service.getAbrufById(pcaId, abrufId).subscribe((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.assignedClientProjectServiceUrl}/${pcaId}/abruf/${abrufId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('should delete an Abruf', () => {
    const abrufId = '123';
    const mockResponse = null;

    service.deleteAbruf(abrufId).subscribe((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.deleteAbrufServiceUrl}/${abrufId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  // Additional test cases for error handling
  it('should handle error when creating an Abruf', () => {
    const pcaId = '123';
    const abrufData = { /* provide test data here */ };

    service.createAbruf(pcaId, abrufData).subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpMock.expectOne(`${environment.abrufServiceUrl}/${pcaId}`);
    expect(req.request.method).toBe('PUT');
    req.flush('Error message', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle error when updating an Abruf', () => {
    const abrufId = '123';
    const abrufData = { /* provide test data here */ };

    service.updateAbruf(abrufId, abrufData).subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.abrufEditServiceUrl}/${abrufId}`);
    expect(req.request.method).toBe('PUT');
    req.flush('Error message', { status: 404, statusText: 'Not Found' });
  });

  it('should handle error when getting an Abruf by ID', () => {
    const pcaId = '123';
    const abrufId = '456';

    service.getAbrufById(pcaId, abrufId).subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(`${environment.assignedClientProjectServiceUrl}/${pcaId}/abruf/${abrufId}`);
    expect(req.request.method).toBe('GET');
    req.flush('Error message', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle error when deleting an Abruf', () => {
    const abrufId = '123';

    service.deleteAbruf(abrufId).subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(403);
      },
    });

    const req = httpMock.expectOne(`${environment.deleteAbrufServiceUrl}/${abrufId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush('Error message', { status: 403, statusText: 'Forbidden' });
  });
});
