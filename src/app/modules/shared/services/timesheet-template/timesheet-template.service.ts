import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TimesheetTemplate } from '../../../../models/timesheet-template';

/**
 * Service for managing timesheet templates.
 * 
 * This service provides methods to upload files, update template data,
 * and retrieve timesheet templates from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class TimesheetTemplateService {

  /** Base URL for the document service API */
  apiUrl = environment.documentServiceUrl;

  /**
   * Constructor for TimesheetTemplateService.
   * 
   * @param http - HttpClient instance for making HTTP requests
   */
  constructor(private http: HttpClient) { }

  /**
   * Uploads a file to the server (deprecated method).
   * 
   * @deprecated Use the `uploadFile` method instead.
   * @param file - The file to be uploaded
   * @returns An Observable of the HTTP response
   */
  uploadFiledeprecated(file: File): Observable<HttpResponse<any>> {
    // Set Content-Disposition header
    const headers = new HttpHeaders({
      'Content-Type': file.type,
      'Content-Disposition': `attachment;filename="${file.name}"`
    });

    // Read file as binary data
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        this.http.post(`${this.apiUrl}/upload`, reader.result, {
          headers: headers,
          observe: 'response',
          responseType: 'text' as const
        }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Base upload method with shared logic for file uploads.
   * 
   * @param file - The file to be uploaded
   * @param endpoint - The API endpoint to upload the file to
   * @returns An Observable of the HTTP response
   */
  private uploadFileToEndpoint(file: File, endpoint: string): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': file.type,
      'Content-Disposition': `attachment;filename="${file.name}"`
    });

    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        this.http.post(`${this.apiUrl}${endpoint}`, reader.result, {
          headers: headers,
          observe: 'response',
          responseType: 'text' as const
        }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Uploads a new file for template creation.
   * 
   * @param file - The file to be uploaded
   * @returns An Observable of the HTTP response
   */
  uploadFile(file: File): Observable<HttpResponse<any>> {
    return this.uploadFileToEndpoint(file, '/upload');
  }

  /**
   * Uploads a new file during template editing.
   * 
   * @param file - The file to be uploaded
   * @returns An Observable of the HTTP response
   */
  uploadFileForEdit(file: File): Observable<HttpResponse<any>> {
    return this.uploadFileToEndpoint(file, '/upload/changeFile');
  }

  /**
   * Updates template data on the server.
   * 
   * @param id - The ID of the template to update
   * @param templateData - The updated template data
   * @returns An Observable of the HTTP response
   */
  updateTemplateData(id: string, templateData: TimesheetTemplate): Observable<HttpResponse<any>> {
    return this.http.patch<any>(`${this.apiUrl}/save/${id}`, templateData, {
      observe: 'response'
    }).pipe(
      map(response => {
        return new HttpResponse({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  /**
   * Retrieves all timesheet templates from the server.
   * 
   * @returns An Observable of an array of TimesheetTemplate objects
   */
  getAllTemplates(): Observable<TimesheetTemplate[]> {
    return this.http.get<TimesheetTemplate[]>(`${this.apiUrl}`);
  }

  /**
   * Retrieves a specific timesheet template by its ID.
   * 
   * @param id - The ID of the template to retrieve
   * @returns An Observable of the HTTP response containing the TimesheetTemplate
   */
  getTemplateById(id: string): Observable<HttpResponse<TimesheetTemplate>> {
    return this.http.get<TimesheetTemplate>(`${this.apiUrl}/${id}`, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<TimesheetTemplate>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  /**
   * Edits an existing timesheet template.
   * 
   * @param id - The ID of the template to edit
   * @param templateData - The updated template data
   * @returns An Observable of the HTTP response
   */
  editTemplateData(id: string, templateData: TimesheetTemplate): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, templateData, {
      observe: 'response'
    }).pipe(
      map(response => {
        return new HttpResponse({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  deleteTemplate(id: string): Observable <HttpResponse<any>> {
    return this.http.patch<any>(`${this.apiUrl}/delete/${id}`, {});
  }
}
