import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../../models/client';
import { EndClient } from '../../../../models/endClient';
import { EndClientDto } from '../../../../models/end-client.model';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};
@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }

  createClient(clientData: Client): Observable<HttpResponse<Client>>{
    return this.http.post<Client>(environment.clientServiceUrl, clientData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Client>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }

  getAllClients(): Observable<HttpResponse<Client[]>>{
    return this.http.get<any>(environment.clientServiceUrl, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Client[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  // getEndClientById(id: string): Observable<HttpResponse<EndClient>>{
  //   return this.http.get<EndClient>(environment.endClientServiceUrl + '/' + id, { headers: httpOptions, observe: 'response' }).pipe(
  //     map(response => {
  //       return new HttpResponse<EndClient>({
  //         body: response.body,
  //         status: response.status,
  //         statusText: response.statusText,
  //       });
  //     })
  //   );
  // }

  getClientById(id: string): Observable<HttpResponse<Client[]>>{
    return this.http.get<Client[]>(environment.clientServiceUrl + '/' + id, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Client[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  updateClient(clientId: string, body: Client): Observable<HttpResponse<Client>>{
    return this.http.put<Client>(environment.clientServiceUrl + '/' + clientId, body, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Client>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  deleteClient(clientId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${environment.clientServiceUrl}/${clientId}`, { observe: 'response' }).pipe(
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
