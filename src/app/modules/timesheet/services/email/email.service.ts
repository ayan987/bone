import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EmailTemplate } from '../../../../models/email-template';
import { environment } from '../../../../environments/environment';
import { PostmarkEmailTemplate } from '../../../../models/postmark-email-template';
import { MilestoneInPreview } from '../../../../models/milestone-preview';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  apiUrlEmail = environment.emailServiceUrl;
  apiUrlPostmarkEmailTemplates = environment.postmarkEmailServiceUrl;
  apiUrlMilestones = environment.milestoneServiceUrl;

  constructor(private http: HttpClient) {}

  getEmailTemplates(): Observable<HttpResponse<EmailTemplate[]>> {
    return this.http
      .get<EmailTemplate[]>(this.apiUrlEmail + '/templates', {
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return new HttpResponse<EmailTemplate[]>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }

  getTemplatePreview(
    templateId: String
  ): Observable<HttpResponse<PostmarkEmailTemplate>> {
    return this.http
      .get<PostmarkEmailTemplate>(
        this.apiUrlPostmarkEmailTemplates + '/templates/' + templateId,
        {
          observe: 'response',
        }
      )
      .pipe(
        map((response) => {
          return new HttpResponse<PostmarkEmailTemplate>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }

  getMilestones(
    projectId: String,
    clientId: String,
    abrufId: String
  ): Observable<HttpResponse<MilestoneInPreview[]>> {
    return this.http
      .get<MilestoneInPreview[]>(
        this.apiUrlMilestones + '/all?projectId=' + projectId + '&clientId=' + clientId + '&abrufId=' + abrufId,
        {
          observe: 'response',
        }
      )
      .pipe(
        map((response) => {
          return new HttpResponse<MilestoneInPreview[]>({
            body: response.body,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        })
      );
  }

  sendEmails(request: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      this.apiUrlEmail + '/sendEmails',
      request,
      {
        observe: 'response'
      }
    ).pipe(
      map((response: any) => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      })
    );
  }
}
