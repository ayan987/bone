import { TestBed } from '@angular/core/testing';
import { PoService } from './po.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpResponse } from '@angular/common/http';

describe('PoService', () => {
  let service: PoService;
  let httpMock: HttpTestingController;

  const httpOptions = { 'Content-Type': 'application/json' }; // Replace with actual options if necessary

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PoService]
    });
    service = TestBed.inject(PoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should create a PO', () => {
    const poData = { title: 'New PO' };
    const mockResponse = { message: 'PO created successfully' };

    service.createPO(poData).subscribe((response: HttpResponse<any>) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(201);
    });

    const req = httpMock.expectOne(service.apiPO);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse, { status: 201, statusText: 'Created' });
  });

  // it('should update a PO', async () => {
  //   const poId = 'po123';
  //   const poData = { title: 'Updated PO' };
  //   const mockResponse = { message: 'PO updated successfully' };

  //   const result = await service.updatePO(poData, poId);

  //   expect(result.body).toEqual(mockResponse); // Ensuring the try block is executed
  //   expect(result.status).toBe(200);

  //   const req = httpMock.expectOne(`${service.apiPO}/${poId}`);
  //   expect(req.request.method).toBe('PUT');
  //   req.flush(mockResponse, { status: 200, statusText: 'OK' });
  // });

  // it('should get PO by ID from PO collection', async () => {
  //   const poId = 'po123';
  //   const mockResponse = { title: 'PO Details' };

  //   const result = await service.getPoByPoIdFromPoCollection(poId);

  //   expect(result.body).toEqual(mockResponse); // Ensuring the try block is executed
  //   expect(result.status).toBe(200);

  //   const req = httpMock.expectOne(`${service.apiPO}/${poId}`);
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockResponse, { status: 200, statusText: 'OK' });
  // });

  it('should get PO by ID', () => {
    const poId = 'po123';
    const mockResponse = { title: 'PO Overview' };

    service.getPOById(poId).subscribe((response: HttpResponse<any>) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiPO}/overview/${poId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('should assign consultant to PG', () => {
    const poId = 'po123';
    const pgId = 'pg123';
    const pgDetails = { consultantId: 'consultant123' };
    const mockResponse = { message: 'Consultant assigned successfully' };

    service.assignConsultantToPG(poId, pgId, pgDetails).subscribe((response: HttpResponse<any>) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiPO}/${poId}/pg/${pgId}/assign-consultants`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('should check if consultant is assigned to PG', () => {
    const postData = { poId: 'po123', pgId: 'pg123' };
    const mockResponse = { isAssigned: true };

    service.checkAssignedConsultantToPG(postData).subscribe((response: HttpResponse<any>) => {
      expect(response.body).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiPO}/check-pgConsultants`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('should delete a PO by id', () => {
    const poId = 'po123';

    service.deletePOById(poId).subscribe((response: HttpResponse<any>) => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiPO}/${poId}`);
    expect(req.request.method).toBe('PATCH');
  });

  it('should check if consultant can be deleted', () => {
    const consultantId = 'consultant123';
    const mockResponse = 'Consultant can be deleted';

    service.checkConsultantDelete(consultantId).subscribe((response: string) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.apiPO}/consultant/${consultantId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should delete PG under PO', () => {
    const poId = 'po123';
    const pgId = 'pg123';

    service.deletePgUnderPo(poId, pgId).subscribe((response: HttpResponse<any>) => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiPO}/${poId}/pg/${pgId}`);
    expect(req.request.method).toBe('PATCH');
  });

  it('should remove consultant from a PG', () => {
    const poId = '123';
    const pgId = '456';
    const assignmentId = '789';
    const mockResponse = {
      body: { success: true },
      status: 200,
      statusText: 'OK'
    };

    service.removeConsultantFromPg(poId, pgId, assignmentId).subscribe((response) => {
      expect(response.body).toEqual(mockResponse.body);
      expect(response.status).toBe(mockResponse.status);
      expect(response.statusText).toBe(mockResponse.statusText);
    });

    const req = httpMock.expectOne(`${service.apiPO}/${poId}/pg/${pgId}/assignment/${assignmentId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse.body, {
      status: mockResponse.status,
      statusText: mockResponse.statusText
    });
  });
});
