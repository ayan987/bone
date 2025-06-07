import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPoPgConsultant } from '../../../../models/po-pg-consultant';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

export interface AssignConsultantObj {
  poId: string;
  pgId: string;
  poNo: string;
  pgName: string;
  consultantDetails: any;
}

@Injectable({
  providedIn: 'root'
})
export class PoService {
  apiPO = environment.poServiceUrl;

  constructor(private http: HttpClient) { }

  createPO(poData: any): Observable<HttpResponse<any>>{
    return this.http.post<any>(this.apiPO, poData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  async updatePO(poData: any,poId: string): Promise<HttpResponse<any>>{
    const response =  await lastValueFrom(this.http.put<any>(this.apiPO + "/" + poId, poData, { observe: 'response' }));
    try {
      return new HttpResponse<any>({
        body: response.body,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      console.error('Error updating PO:', error);
      throw error;
    }
  }

  async getPoByPoIdFromPoCollection(poId: string): Promise<HttpResponse<any>> {
    try {
      const response = await lastValueFrom(this.http.get<any>(this.apiPO + "/" + poId, { headers: httpOptions, observe: 'response' }));
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

  getPOById(poId: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiPO}/overview/${poId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  getPoDetailsById(poId: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiPO}/${poId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  /** Assign consultant to pg */
  assignConsultantToPG(assignConsultantObj: AssignConsultantObj, generatedBy: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiPO}/${assignConsultantObj.poId}/pg/${assignConsultantObj.pgId}/${assignConsultantObj.poNo}/${assignConsultantObj.pgName}/assign-consultants?generatedBy=${generatedBy}`, assignConsultantObj.consultantDetails, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  /** Api to check if po, PG has assigned consultant */
  checkAssignedConsultantToPG(PostData: any): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.apiPO}/check-pgConsultants`, PostData,  { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  /** Api to delete a po by id */
  deletePOById(poId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiPO}/${poId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText,
        });
      })
    );
  }

  /** Check if consultant can be deleted or not (not using now)*/
  checkConsultantDelete(consultantId: any): Observable<string>{
    return this.http.get(`${this.apiPO}/consultant/${consultantId}`, { responseType: 'text' });
  }

  /** Check if Template is assigned to a PO, if yes it cannot be deleted */
  checkTemplateDelete(templateId: string): Observable<string>{
    return this.http.get(`${this.apiPO}/timesheetTemplate/${templateId}`, { responseType: 'text' })
  }

  /** Api to delete pg under po */
  deletePgUnderPo(poId: string, pgId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiPO}/${poId}/pg/${pgId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText
        });
      })
    );
  }

  /** Api to remove consultant under pg */
  removeConsultantFromPg(poId: string, pgId: string, assignmentId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiPO}/${poId}/pg/${pgId}/assignment/${assignmentId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText
        });
      })
    );
  }

  async editAssignedConsultant(model: IPoPgConsultant): Promise<HttpResponse<any>> {

    try {
      let url = `${this.apiPO}/consultant/${model.consultantId}/edit-assigned-consultant`;

      const response = await lastValueFrom(this.http.patch<any>(url,model, { headers: httpOptions, observe: 'response' }));
      return new HttpResponse<any>({
        body: response.body,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      console.error('Error updating assigned consultant:', error);
      throw error;
    }
  }
  /** Api to check if po, PG has assigned timesheetEntries */
  checkTimesheetEntry(poId: string, pgId: string, assignmentId: string): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.apiPO}/check-timesheetEntries/poId/${poId}/pgId/${pgId}/assignmentId/${assignmentId}`, { headers: httpOptions, observe: 'response' });
  }

  /** Api to check if po has remote hours entry in timesheet */
  checkRemoteTimesheetEntry(poId: string): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.apiPO}/check-remoteTimesheetEntriesPO/poId/${poId}`, { headers: httpOptions, observe: 'response' });
  }
}
