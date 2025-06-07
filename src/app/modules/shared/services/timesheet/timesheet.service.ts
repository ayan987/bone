import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  apiTimesheet = environment.timesheetServiceUrl;

  constructor(private http: HttpClient) { }

  async getTimesheetTotalsForOnsiteAndRemote(poId: string, pgId: string): Promise<HttpResponse<any>>{
    try {
      const response = await lastValueFrom(this.http.get<any>(this.apiTimesheet + "/" + poId + "/" + "pg" + "/" + pgId, { headers: httpOptions, observe: 'response' }));
      return new HttpResponse<any>({
        body: response.body,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      console.error('Error fetching PO by ID:', error);
      throw error;
    }
  }

}
