import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Holiday } from '../../../models/holiday';
@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  apiUrl = environment.holidayServiceUrl

  constructor(private http: HttpClient) { }

  getHolidaysByCityAndYear(city: string, year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/city/${city}/year/${year}`);
  }

  createHoliday(holidayData: Holiday): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, holidayData)
  }

  updateHoliday(id: string, holidayData: Holiday): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, holidayData);
  }

  copyHoliday(holidayData: Holiday): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/copyHolidaysFromPreviousYear`, holidayData)
  }
}
