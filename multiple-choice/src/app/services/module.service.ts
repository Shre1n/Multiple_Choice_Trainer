import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  Firestore,
  getDocs,
  query,
  setDoc
} from "@angular/fire/firestore";
import {ModuleModule} from "../module/module.module";
import {environment} from "../../environments/environment.prod";
import {recording} from "ionicons/icons";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private modules: ModuleModule[];
  private nextId: number;

  modulesCollectionRef: CollectionReference<DocumentData>;

  private baseUrl = "http://localhost:8888";

  constructor(private http: HttpClient, private firestore: Firestore) {
    this.modulesCollectionRef= collection(firestore, 'modules');
    const modulesJSON: string| null = localStorage.getItem('modules');

    if (modulesJSON){
      this.modules = JSON.parse(modulesJSON);
      this.nextId = parseInt(localStorage.getItem('nextId')?? "1",10);
    }else{
      this.modules = [];
      this.nextId = 1;
      if (!environment.production){
        this.persist(new ModuleModule(8,"Design","GASM1","Grundlagen und Anwendungen"));
      }
    }
  }

  persist(module: ModuleModule){
    module.id = this.nextId++;
    this.modules.push(module);
    this.saveModulesToFirestore(module);
    this.saveLocal();
  }

  private  saveLocal(){
    localStorage.setItem('records', JSON.stringify(this.modules));
    localStorage.setItem('nextId', this.nextId.toString());
  }

  private  async saveModulesToFirestore(module: ModuleModule): Promise<void> {
    if (module.id == null) {
      console.error('There is nothing to save');
      return;
    }
    try {
      const moduleRef = doc(this.modulesCollectionRef, module.id.toString());
      await setDoc(moduleRef,{
        category: module.category,
        name: module.name,
        description: module.description
      });
      console.log('saved to Firestore:', module);
    }catch (error) {
      console.log('Error saving to Firestore', error);
    }
  }

  async findAll(): Promise<ModuleModule[]> {
    const filterQuery = query(this.modulesCollectionRef)
    const moduleDocs = await getDocs(filterQuery);

    this.modules = moduleDocs.docs.map(doc => {
      const data = doc.data() as Omit<ModuleModule,'id'>;
      return {
        id: parseInt(doc.id, 10),
        ...data
      }as ModuleModule;
    });
    this.saveLocal();
  return  this.modules;
  console.log(this.findAll())
  }



  loadExternalModule(): Observable<any> {
    const url: string = `${this.baseUrl}/load-all-modules`;
    return this.http.get<any>(url);
  }

  checkForUpdates(): Observable<{ updatesAvailable: boolean }> {
    const url = `${this.baseUrl}/check-updates`;
    return this.http.get<{ updatesAvailable: boolean }>(url);
  }
}
