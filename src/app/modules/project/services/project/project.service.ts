import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project } from '../../../../models/project';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiProject = environment.projectServiceUrl;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<HttpResponse<Project[]>> {
    return this.http.get<any>(this.apiProject, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Project[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  createProject(project: Project): Observable<HttpResponse<Project>> {
    return this.http.post<Project>(this.apiProject, project, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Project>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  getProjectById(projectId: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any>(`${this.apiProject}/${projectId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Project[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  updateProject(projectId: string, body: Project): Observable<HttpResponse<Project>>{
    return this.http.put<Project>(this.apiProject + '/' + projectId, body, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Project>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  deleteProjectById(projectId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(`${this.apiProject}/${projectId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText
        });
      })
    ); 
  }
}
