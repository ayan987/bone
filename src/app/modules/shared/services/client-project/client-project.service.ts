import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../../models/client';
import { AssignedclientProject } from '../../../../models/assignedClientProjects';

const httpOptions = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

@Injectable({
  providedIn: 'root',
})
export class ClientProjectService {
  apiClientProject = environment.clientProjectServiceUrl;
  apiClient = environment.clientServiceUrl;
  apiProjectOverview = environment.projectOverviewServiceUrl;
  apiAssignedClientProject = environment.assignedClientProjectServiceUrl;

  constructor(private http: HttpClient) {}

  assignClientToProject(projectStatus: string, clients: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.apiClientProject + '/' + projectStatus, clients, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  //Api to fetch the list of project and client associated
  getAssociatedClientProject(): Observable<HttpResponse<AssignedclientProject[]>> {
    return this.http.get<AssignedclientProject[]>(this.apiAssignedClientProject, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  //Api to fetch the list of project and client associated
  filterAbrufWithProjectAndClient(projectId: string, clientId: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(this.apiAssignedClientProject + '/abrufs/' + projectId + '/' + clientId, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  //Api to get all list of clients
  getAllClients(): Observable<HttpResponse<Client[]>> {
    return this.http.get<Client[]>(this.apiClient, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Client[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  //Api to get project overview page
  getProjectOverview(): Observable<HttpResponse<any>> {
    return this.http.get<any>(this.apiProjectOverview, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

    /** Api to if client is associated with project */
    checkClientIsAssociatedWithProject(clientId: string): Observable<HttpResponse<any>>{
      return this.http.get<any>(`${this.apiAssignedClientProject}/check-client/${clientId}`, { headers: httpOptions, observe: 'response' });
    }

    checkIsAbrufOrPOAssociatedWithProjectClient(id: string): Observable<HttpResponse<any>>{
      return this.http.get<any>(
        `${this.apiAssignedClientProject}/check-abrufOrPO/${id}`,
         { headers: httpOptions, observe: 'response' });
    }

    deleteCleintProjectById(id: string): Observable<HttpResponse<any>>{
      return this.http.patch<any>(`${this.apiAssignedClientProject}/delete/${id}`, { observe: 'response' }).pipe(
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
