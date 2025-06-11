import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TimesheetService } from './timesheet.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

describe('TimesheetService', () => {
  let service: TimesheetService;
  let httpTestingController: HttpTestingController;
  let httpClientSpy: { patch: jasmine.Spy }; // For Test Case 3

  const mockApiImportTimesheet = 'http://localhost:8080/api/import-timesheet'; // Example URL

  beforeEach(() => {
    // For Test Case 3, we need to spy on httpClient before TestBed configuration
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['patch']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TimesheetService]
    });
    service = TestBed.inject(TimesheetService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Override service's actual api url for consistent testing if it's complex
    service.apiImportTimesheet = mockApiImportTimesheet;
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateImportedTimesheetStatus', () => {
    const importedTimesheetId = 'test-id-123';
    const statusKey = 'TS_APPROVED';

    it('should handle successful response with body (200 OK)', () => {
      const mockResponseBody = { message: 'success' };
      const expectedResponse = new HttpResponse({ status: 200, body: mockResponseBody });

      service.updateImportedTimesheetStatus(importedTimesheetId, statusKey).subscribe(
        response => {
          expect(response).toEqual(expectedResponse);
          expect(response.body).toEqual(mockResponseBody);
          expect(response.status).toBe(200);
        },
        fail
      );

      const req = httpTestingController.expectOne(
        `${mockApiImportTimesheet}/${importedTimesheetId}/updateStatus?status=${statusKey}`
      );
      expect(req.request.method).toEqual('PATCH');
      req.flush(mockResponseBody, { status: 200, statusText: 'OK' });
    });

    it('should handle successful response with no body (204 No Content)', () => {
      const expectedResponse = new HttpResponse({ status: 204, body: null, statusText: 'No Content' });

      service.updateImportedTimesheetStatus(importedTimesheetId, statusKey).subscribe(
        response => {
          expect(response.status).toBe(204);
          expect(response.body).toBeNull();
        },
        fail
      );

      const req = httpTestingController.expectOne(
        `${mockApiImportTimesheet}/${importedTimesheetId}/updateStatus?status=${statusKey}`
      );
      expect(req.request.method).toEqual('PATCH');
      req.flush(null, { status: 204, statusText: 'No Content' }); // body is null for 204
    });

    it('should handle unexpected null response from HttpClient.patch (simulated)', () => {
      // This test case needs to bypass HttpTestingController for the specific call
      // to simulate the observable chain receiving a null value.
      // We use a spy on the actual http client used by the service for this specific scenario.
      // This requires injecting the actual HttpClient and spying, or providing a spy directly.
      // For simplicity in this context, we'll assume the service's http client can be spied upon
      // or we can re-provide TimesheetService with a spied HttpClient for this specific test.

      // Re-configure service with a spied http client for this test
      const spiedHttpClient = jasmine.createSpyObj('HttpClient', ['patch']);
      spiedHttpClient.patch.and.returnValue(of(null as any)); // Simulate observable emitting null

      const localService = new TimesheetService(spiedHttpClient);
      localService.apiImportTimesheet = mockApiImportTimesheet; // Ensure URL is set

      localService.updateImportedTimesheetStatus(importedTimesheetId, statusKey).subscribe(
        response => {
          expect(response.status).toBe(500);
          expect(response.statusText).toBe('Unexpected null response from HTTP call mapping');
          expect(response.body).toBeNull();
        },
        fail
      );
      expect(spiedHttpClient.patch).toHaveBeenCalledOnceWith(
         `${mockApiImportTimesheet}/${importedTimesheetId}/updateStatus?status=${statusKey}`,
         { observe: 'response' }
      );
      // No httpTestingController.expectOne or verify for this specific spy-based test.
      // To prevent afterEach from failing, we make sure no other requests are expected.
      httpTestingController.expectNone('');
    });


    it('should handle API error (e.g., 400 Bad Request)', () => {
      const mockErrorResponse = { status: 400, statusText: 'Bad Request', error: 'Invalid data' };

      service.updateImportedTimesheetStatus(importedTimesheetId, statusKey).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
          expect(error.error).toBe('Invalid data');
        }
      });

      const req = httpTestingController.expectOne(
        `${mockApiImportTimesheet}/${importedTimesheetId}/updateStatus?status=${statusKey}`
      );
      expect(req.request.method).toEqual('PATCH');
      req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
    });
  });
});
