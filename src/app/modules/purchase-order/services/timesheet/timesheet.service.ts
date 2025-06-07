import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Timesheet } from '../../../../models/timesheet';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  apiPO = environment.poServiceUrl;
  apiTimesheet = environment.timesheetServiceUrl;

  constructor(private http: HttpClient) { }

  getConsultantsByPOAndPgId(poId: string, pgId: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiPO}/${poId}/pg/${pgId}/consultants`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  getConsultantsByPOIdPgIdMonthAndYear(poId: string, pgId: string, month: number, year: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiTimesheet}/${poId}/pg/${pgId}/month/${month}/year/${year}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  createTimesheetEntry(timesheetData: any): Observable<HttpResponse<any>> {
    return this.http.post<Timesheet>(`${this.apiTimesheet}`, timesheetData, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText,
        });
      })
    );
  }
}
