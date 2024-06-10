import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  constructor(private http: HttpClient) { }


  loadLocalModule(moduleName: string): Observable<any> {
    return this.http.get<any>('http://localhost:8888/modules/' + moduleName);
  }
}
