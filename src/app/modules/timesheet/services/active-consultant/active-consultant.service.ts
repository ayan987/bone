import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import { ActiveConsultant } from '../../../../models/timesheet-consultant';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';

@Injectable({
  providedIn: 'root'
})
export class ActiveConsultantService {
  apiUrlActiveConsultant = environment.activeConsultantServiceUrl;
  apiUrlGeneratedTimesheet = environment.generatedTimesheetServiceUrl;

  constructor(private http: HttpClient) { }

  getAllActiveConsultants(filter: FilterCriteria): Observable<HttpResponse<ActiveConsultant[]>>{
    return this.http.post<ActiveConsultant[]>(this.apiUrlActiveConsultant, filter, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<ActiveConsultant[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getTimesheets(filter: FilterCriteria): Observable<HttpResponse<GeneratedTimesheet[]>>{
    return this.http.post<GeneratedTimesheet[]>(this.apiUrlGeneratedTimesheet + '/filtered', filter, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<GeneratedTimesheet[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }
}
