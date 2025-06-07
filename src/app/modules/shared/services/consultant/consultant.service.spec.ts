import { TestBed } from '@angular/core/testing';
import { ConsultantService } from './consultant.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Consultant } from '../../../../models/consultant';

describe('ConsultantService', () => {
  let service: ConsultantService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ConsultantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a consultant', () => {
    const consultantData: Consultant = {
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      status: ''
    };

    service.createConsultant(consultantData).subscribe((response: HttpResponse<Consultant>) => {
      expect(response.body).toEqual(consultantData);
      expect(response.status).toBe(201); // Assuming a 201 status code for creation
    });

    const req = httpMock.expectOne(service.apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(consultantData, { status: 201, statusText: 'Created' });
  });

  it('should get all consultants', () => {
    const consultantsData: Consultant[] = [
      { _id: '123', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', status: 'Active' },
      { _id: '124', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', status: 'Inactive' }
    ];

    service.getAllConsultants().subscribe((response: HttpResponse<Consultant[]>) => {
      expect(response.body).toEqual(consultantsData);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(service.apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(consultantsData, { status: 200, statusText: 'OK' });
  });

  it('should get a consultant by id', () => {
    const consultantId = '123';
    const consultantData: Consultant = {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: 'Active'
    };

    service.getConsultantById(consultantId).subscribe((response: HttpResponse<Consultant>) => {
      expect(response.body).toEqual(consultantData);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/${consultantId}`);
    expect(req.request.method).toBe('GET');
    req.flush(consultantData, { status: 200, statusText: 'OK' });
  });

  it('should edit a consultant', () => {
    const consultantId = '123';
    const consultantData: Consultant = {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: 'Active'
    };

    service.editConsultant(consultantId, consultantData).subscribe((response: HttpResponse<Consultant>) => {
      expect(response.body).toEqual(consultantData);
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/${consultantId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(consultantData, { status: 200, statusText: 'OK' });
  });

  it('should delete a consultant', () => {
    const consultantId = '123';
    const expectedResponse: HttpResponse<any> = {
      body: null,
      type: HttpEventType.Response,
      clone: function (): HttpResponse<any> {
        throw new Error('Function not implemented.');
      },
      headers: new HttpHeaders(),
      status: 200,
      statusText: 'No Content',
      url: null,
      ok: true
    };

    service.deleteConsultant(consultantId).subscribe((response: HttpResponse<any>) => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/${consultantId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null, { status: 200, statusText: 'No Content' });
  });
});
