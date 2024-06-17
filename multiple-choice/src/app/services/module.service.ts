import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private baseUrl = "http://localhost:8888";

  constructor(private http: HttpClient) { }


  loadExternalModule(): Observable<any> {
    const url: string = `${this.baseUrl}/load-all-modules`;
    return this.http.get<any>(url);
  }

  checkForUpdates(): Observable<{ updatesAvailable: boolean }> {
    const url = `${this.baseUrl}/check-updates`;
    return this.http.get<{ updatesAvailable: boolean }>(url);
  }
}
