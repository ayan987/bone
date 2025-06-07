import { TestBed } from '@angular/core/testing';

import { ClientsService } from './clients.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Client } from '../../../../models/client';
import { environment } from '../../../../environments/environment';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientsService]
    });
    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request to create a client', () => {
    const mockClient: Client = {
      id: '',
      shortName: '',
      legalName: '',
      status: ''
    };

    service.createClient(mockClient).subscribe((response) => {
      expect(response.body).toEqual(mockClient);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(environment.clientServiceUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockClient);
  });

  it('should send a GET request to retrieve all clients', () => {
    const mockClients: Client[] = [
      {
        id: '1',
        shortName: 'Client 1',
        legalName: 'Client One',
        status: 'ACTIVE'
      },
      {
        id: '2',
        shortName: 'Client 2',
        legalName: 'Client Two',
        status: 'INACTIVE'
      }
    ];

    service.getAllClients().subscribe((response) => {
      expect(response.body).toEqual(mockClients);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(environment.clientServiceUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockClients);
  });

  it('should send a GET request to retrieve a client by ID', () => {
    const mockClientId = '1';
    const mockClient: Client[] = [{
      id: mockClientId,
      shortName: 'Client 1',
      legalName: 'Client One',
      status: 'ACTIVE'
    }];

    service.getClientById(mockClientId).subscribe((response) => {
      expect(response.body).toEqual(mockClient);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    const req = httpMock.expectOne(environment.clientServiceUrl + '/' + mockClientId);
    expect(req.request.method).toBe('GET');
    req.flush(mockClient);
  });

  //Update Service

  it('should send a PUT request to update a client', () => {
    const mockClientId = '1';
    const mockClient: Client = {
      id: mockClientId,
      shortName: 'Updated Client',
      legalName: 'Updated Client Name',
      status: 'ACTIVE'
    };

    service.updateClient(mockClientId, mockClient).subscribe();

    const req = httpMock.expectOne(environment.clientServiceUrl + '/' + mockClientId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockClient);
    req.flush(mockClient);
  });
});
