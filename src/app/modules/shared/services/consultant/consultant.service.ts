import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Consultant } from '../../../../models/consultant';

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {
  apiUrl = environment.consultantServiceUrl;

  constructor(private http: HttpClient) { }

  createConsultant(consultantData: Consultant): Observable<HttpResponse<Consultant>>{
    return this.http.post<Consultant>(this.apiUrl, consultantData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Consultant>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getAllConsultants(): Observable<HttpResponse<Consultant[]>> {
    return this.http.get<Consultant[]>(this.apiUrl, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Consultant[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getConsultantById(id: string): Observable<HttpResponse<Consultant>>{
    return this.http.get<Consultant>(`${this.apiUrl}/${id}`, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Consultant>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      })
    );
  }

  editConsultant(consultantId: string, consultantData: Consultant): Observable<HttpResponse<Consultant>> {
    return this.http.put<Consultant>(`${this.apiUrl}/${consultantId}`, consultantData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Consultant>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  deleteConsultant(consultantId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiUrl}/${consultantId}`, { observe: 'response' }).pipe(
      map(response =>{
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText,
          headers: response?.headers
        })
      })
    )
  }
}
