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
export class TimesheetService {

  constructor(private readonly http: HttpClient) { }

  apiTimesheet = environment.generatedTimesheetServiceUrl;
  apiTimesheetDownload = environment.documentServiceUrl;
  apiImportTimesheet = environment.importTimesheetServiceUrl;
  apiComment = environment.commentServiceUrl;

  generateTimesheets(request: any, isRegeneration: boolean): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      this.apiTimesheet + '/generate' + '?isRegeneration=' + isRegeneration,
      request,
      {
        observe: 'response'
      }
    ).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type if not already
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  downloadGeneratedTimesheet(request: any): Observable<HttpResponse<any>> {
    const fileId = request.fileId;
    const fileName = request.fileName;
    const url = `${this.apiTimesheetDownload}/ts/download?fileId=${fileId}&fileName=${fileName}`;

    return this.http.get(url, {
      headers: { token: request.token },
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  deleteOfGeneratedTimesheet(request: any): Observable<HttpResponse<any>> {
    const fileId = encodeURIComponent(request.fileId);
    const url = `${this.apiTimesheet}/${request.timesheetId}/file/${fileId}`;

    return this.http.delete(url, {
      headers: { token: request.token },
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    )};

  getImportTimesheetData(checksum: string | undefined): Observable<HttpResponse<any>> {
    return this.http.get<any>(
      `${this.apiImportTimesheet}/checksum/${checksum}`,
      {
        observe: 'response'
      }
    ).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  addComment(request: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.apiComment ,request,{ observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getCommentByTimesheetId(timesheetId?: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiComment}/${timesheetId}` ,{ observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  editCommentByStatus(request: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(this.apiComment, request ,{ observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  deleteCommentByCommentId(commentId: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.apiComment}/${commentId}`, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getAllTimesheetStatusTemplates(): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.apiTimesheet}/statuses`, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getAllUnmatchedImportedTimesheet(): Observable<HttpResponse<any[]>>{
    return this.http.get<any>(`${this.apiImportTimesheet}/unmatched`, { headers: httpOptions, observe: 'response' }).pipe(
      map((response: HttpResponse<any[]>) => { // Explicitly type
        return new HttpResponse<any[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  importGeneratedTimesheet(responseBody: any, isAutomatic: boolean, importedBy: string): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.apiImportTimesheet}/import?isAutomatic=${isAutomatic}&importedBy=${importedBy}`, responseBody, { headers: httpOptions, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({ // Assuming it should be HttpResponse<any> not HttpResponse<any[]>
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      }
      )
    )
  }

  getImportTimesheetById(timesheetId: string): Observable<HttpResponse<any>>{
    return this.http.get<any>(`${this.apiImportTimesheet}/id/${timesheetId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({ // Assuming it should be HttpResponse<any> not HttpResponse<any[]>
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      }
      )
    )
  }

  deleteImportTimesheetById(timesheetId: string): Observable<HttpResponse<any>>{
    return this.http.delete<any>(`${this.apiImportTimesheet}/id/${timesheetId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({ // Assuming it should be HttpResponse<any> not HttpResponse<any[]>
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      }
      )
    )
  }

  updateGeneratedTimesheetStatus(timesheetId: any, request: any): Observable<HttpResponse<any>> {
    return this.http.patch<any>(`${this.apiTimesheet}/${timesheetId}/statuses`, request, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  updateImportedTimesheetStatus(importedTimesheetId: string, status: any): Observable<HttpResponse<any>> {
    return this.http.patch<any>(`${this.apiImportTimesheet}/${importedTimesheetId}/updateStatus?status=${status}`, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => { // Explicitly type response as HttpResponse<any>
        if (response) { // Check if response object itself is truthy
          return new HttpResponse<any>({
            body: response.body, // response.body can be null here (e.g. for 204 No Content / ResponseEntity<Void>)
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } else {
          console.error('Unexpected null response received in TimesheetService.updateImportedTimesheetStatus map operator');
          return new HttpResponse<any>({
            status: 500, // Internal Server Error or a custom error status
            statusText: 'Unexpected null response from HTTP call mapping',
            body: null
          });
        }
      })
    );
  }
}
