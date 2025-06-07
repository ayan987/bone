import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Milestone } from '../../../../models/milestone.model';

const httpOptions = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  apiMilestone = environment.milestoneServiceUrl;

  constructor(private readonly http: HttpClient) { }

  createMilestone(milestoneData: Milestone[]): Observable<HttpResponse<Milestone[]>> {
    return this.http.post<Milestone[]>(this.apiMilestone, milestoneData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Milestone[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  getMilestoneByAbrufId(abrufId: string): Observable<HttpResponse<Milestone[]>> {
    return this.http.get<Milestone[]>(`${this.apiMilestone}?abrufId=${abrufId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Milestone[]>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  deleteMilestone(milestoneId: string): Observable<HttpResponse<Milestone>> {
    return this.http.delete<Milestone>(`${this.apiMilestone}/${milestoneId}`, { headers: httpOptions, observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<Milestone>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }
}
