import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CreateAbruf } from '../../../../models/createAbruf';
import { UpdateAbruf } from '../../../../models/updateAbruf';

@Injectable({
  providedIn: 'root'
})
export class AbrufService {

  constructor(private http: HttpClient) { }

  apiCreateAbruf = environment.abrufServiceUrl;
  getAbrufByIdUrl = environment.assignedClientProjectServiceUrl;
  apiUpdateAbruf = environment.abrufEditServiceUrl;
  apiDeleteAbruf = environment.deleteAbrufServiceUrl;

  createAbruf(pcaId: string, abrufData: any): Observable<HttpResponse<CreateAbruf>>{
    return this.http.put<CreateAbruf>(this.apiCreateAbruf + '/' + pcaId, abrufData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  getAbrufById(pcaId: string, abrufId: string): Observable<HttpResponse<any>>{
    return this.http.get<any>(this.getAbrufByIdUrl + '/' + pcaId + '/abruf/' + abrufId, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  updateAbruf(abrufId: string, abrufData: any): Observable<HttpResponse<UpdateAbruf>>{
    return this.http.put<UpdateAbruf>(this.apiUpdateAbruf + '/' + abrufId, abrufData, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response.body,
          status: response.status,
          statusText: response.statusText,
        });
      })
    );
  }

  deleteAbruf(abrufId: string): Observable<HttpResponse<any>>{
    return this.http.patch<any>(this.apiDeleteAbruf + '/' + abrufId, { observe: 'response' }).pipe(
      map(response => {
        return new HttpResponse<any>({
          body: response?.body,
          status: response?.status,
          statusText: response?.statusText,
        });
      })
    );
  }
}
