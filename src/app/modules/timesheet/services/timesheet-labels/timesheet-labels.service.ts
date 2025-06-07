import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

@Injectable({
  providedIn: 'root'
})
export class TimesheetLabelsService {

  constructor(private readonly http: HttpClient) { }
  apiUrlLabels = environment.timesheetLabelServiceUrl;

  getAllLabels(): Observable<HttpResponse<any[]>>{
    return this.http.get<any>(this.apiUrlLabels, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  assignLabelsToTimsheet(timesheetId: string, labelsArray: any): Observable<HttpResponse<any[]>>{
    return this.http.put<any>(this.apiUrlLabels + '/timesheet/' +  timesheetId, labelsArray, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  removeLabelsFromTimsheet(timesheetId: string, labelId: string): Observable<HttpResponse<any[]>>{
    return this.http.put<any>(this.apiUrlLabels + '/timesheet/' +  timesheetId + '/label/' + labelId, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }
}
