import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EndClientDto } from '../../../../models/end-client.model';
import { EndClient } from '../../../../models/endClient';

const httpOptions = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

@Injectable({
  providedIn: 'root',
})
export class EndclientService {
  constructor(private readonly http: HttpClient) {}
  apiUrl = environment.endClientServiceUrl;

  // getEndClients(): Observable<HttpResponse<EndClient[]>> {
  //   return this.http
  //     .get<any>(this.apiUrl, { headers: httpOptions, observe: 'response' })
  //     .pipe(
  //       map((response) => {
  //         return new HttpResponse<EndClient[]>({
  //           body: response.body,
  //           status: response.status,
  //           statusText: response.statusText,
  //         });
  //       })
  //     );
  // }

  getAllEndClients(): Observable<HttpResponse<EndClient[]>> {
    return this.http
      .get<any>(environment.endClientServiceUrl, {
        headers: httpOptions,
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new HttpResponse<EndClient[]>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
          });
        })
      );
  }

  createEndClient(
    clientData: EndClientDto
  ): Observable<HttpResponse<EndClient>> {
    return this.http
      .post<EndClient>(environment.endClientServiceUrl, clientData, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new HttpResponse<EndClient>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }

  updateEndClient(dto: EndClient): Observable<HttpResponse<EndClient>> {
    return this.http
      .put<EndClient>(`${environment.endClientServiceUrl}/${dto.id}`, dto, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new HttpResponse<EndClient>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }

  getEndClientById(id: string): Observable<HttpResponse<EndClient>> {
    return this.http
      .get<EndClient>(`${environment.endClientServiceUrl}/${id}`, {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new HttpResponse<EndClient>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }
}
