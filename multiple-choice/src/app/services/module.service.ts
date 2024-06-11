import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  constructor(private http: HttpClient) { }


  loadExternalModule(): Observable<any> {
    return this.http.get<any>('http://localhost:8888/load-all-modules');
  }
}
