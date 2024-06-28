import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  Firestore, getDoc,
  getDocs, orderBy,
  query,
  setDoc, updateDoc
} from "@angular/fire/firestore";
import {ModuleModule} from "../module/module.module";
import {environment} from "../../environments/environment.prod";
import {recording} from "ionicons/icons";
import {AuthService} from "./auth.service";
import index from "eslint-plugin-jsdoc";
import {get} from "@angular/fire/database";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private modules: ModuleModule[];
  private nextId: number;

  modulesCollectionRef: CollectionReference<DocumentData>;

  private baseUrl = "http://localhost:8888";

  constructor(private http: HttpClient,
              private firestore: Firestore,
              private authService: AuthService) {
    this.modulesCollectionRef = collection(firestore, 'modules');
    const modulesJSON: string | null = localStorage.getItem('modules');

    if (modulesJSON) {
      this.modules = JSON.parse(modulesJSON);
      this.nextId = parseInt(localStorage.getItem('nextId') ?? "1", 10);
    } else {
      this.modules = [];
      this.nextId = 1;
      if (!environment.production) {
        this.persist(new ModuleModule(8, "Design", "GASM1", "Grundlagen und Anwendungen"));
      }
    }
  }

  persist(module: ModuleModule) {
    module.id = this.nextId++;
    this.modules.push(module);
    this.saveModulesToFirestore(module);
    this.saveLocal();
  }

  private saveLocal() {
    localStorage.setItem('records', JSON.stringify(this.modules));
    localStorage.setItem('nextId', this.nextId.toString());
  }

  async sortModulesByLastStudied(userSessions: any[]): Promise<void> {
    userSessions.forEach(session => {
      session.modules.sort((a: { lastStudied: string | number | Date; }, b: { lastStudied: string | number | Date; }) => {
        const dateA = new Date(a.lastStudied);
        const dateB = new Date(b.lastStudied);
        return dateB.getTime() - dateA.getTime();
      });
    });
  }

  private async saveModulesToFirestore(module: ModuleModule): Promise<void> {
    if (module.id == null) {
      console.error('There is nothing to save');
      return;
    }
    try {
      const moduleRef = doc(this.modulesCollectionRef, module.id.toString());
      await setDoc(moduleRef, {
        category: module.category,
        name: module.name,
        description: module.description
      });
      console.log('saved to Firestore:', module);
    } catch (error) {
      console.log('Error saving to Firestore', error);
    }
  }

  async deleteUserModule(category: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        let existingData: any = {};
        if (userDoc.exists()) {
          existingData = userDoc.data();
        }
        if (!existingData.selfmademodules) {
          existingData.selfmademodules = [];
        }

        existingData.selfmademodules = existingData.selfmademodules.filter((selfmademodule: any) => selfmademodule.category !== category);
        await setDoc(userRef, existingData, { merge: true });
        console.log('Module deleted successfully');
      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  }

  async saveModule(moduleData: any) {
    const user = await this.authService.getCurrentUser();
    if (user){
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        let existingData: any = {};
        if (userDoc.exists()) {
          existingData = userDoc.data();
        }
        if (!existingData.selfmademodules) {
          existingData.selfmademodules = [];
        }

        // Prüfe, ob die Kategorie bereits existiert
        const existingCategoryIndex = existingData.selfmademodules.findIndex((selfmademodule: any) => selfmademodule.category === moduleData.category);

        if (existingCategoryIndex !== -1) {
          // Kategorie existiert bereits, füge die neuen Module hinzu oder aktualisiere bestehende Module
          moduleData.modules.forEach((newModule: any) => {
            const existingModuleIndex = existingData.selfmademodules[existingCategoryIndex].modules.findIndex((module: any) => module.question === newModule.question);
            if (existingModuleIndex !== -1) {
              // Modul existiert bereits, aktualisiere answeredCorrectlyCount und answeredIncorrectlyCount
              existingData.selfmademodules[existingCategoryIndex].modules[existingModuleIndex].answeredCorrectlyCount += newModule.answeredCorrectlyCount;
              existingData.selfmademodules[existingCategoryIndex].modules[existingModuleIndex].answeredIncorrectlyCount += newModule.answeredIncorrectlyCount;
            } else {
              // Modul existiert noch nicht, füge es hinzu
              existingData.selfmademodules[existingCategoryIndex].modules.push(newModule);
            }
          });
        } else {
          // Füge die neue Kategorie hinzu, da sie noch nicht existiert
          existingData.selfmademodules.push(moduleData);
        }

        await setDoc(userRef, existingData, { merge: true });
        console.log('Module saved successfully');

      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  }


  async saveUserModulesToFirestore(module: any): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        let existingData: any = {};
        if (userDoc.exists()) {
          existingData = userDoc.data();
        }
        if (!existingData.selfmademodules) {
          existingData.selfmademodules = [];
        }

        existingData.selfmademodules.push(module);
        await setDoc(userRef, existingData, { merge: true });
      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  }



  async saveSession(userID: string, sessionData: any) {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${userID}`);
      try {

        const userDoc = await getDoc(userRef);
        let existingData: any = {};
        if (userDoc.exists()) {
          existingData = userDoc.data();
        }

        if (!existingData.sessions) {
          existingData.sessions = [];
        }

        // Prüfe, ob die Kategorie bereits existiert
        const existingSessionIndex = existingData.sessions.findIndex((session: any) => session.category === sessionData.category);

        if (existingSessionIndex !== -1) {
          // Kategorie existiert bereits, aktualisiere answeredCorrectlyCount und answeredIncorrectlyCount
          sessionData.modules.forEach((newModule: any) => {
            const existingModuleIndex = existingData.sessions[existingSessionIndex].modules.findIndex((module: any) => module.question === newModule.question);
            if (existingModuleIndex !== -1) {
              existingData.sessions[existingSessionIndex].modules[existingModuleIndex].answeredCorrectlyCount += newModule.answeredCorrectlyCount;
              existingData.sessions[existingSessionIndex].modules[existingModuleIndex].answeredIncorrectlyCount += newModule.answeredIncorrectlyCount;
            }
          });
          existingData.sessions[existingSessionIndex].lastStudied = new Date().toISOString();
        } else {
          // Füge die neue Sitzung hinzu, da die Kategorie noch nicht existiert
          sessionData.lastStudied = new Date().toISOString();
          existingData.sessions.push(sessionData);
        }


        await setDoc(userRef, existingData, { merge: true });
        console.log('Session saved successfully');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } else {
      console.error('No user is logged in');
    }
  }

  async getUserSessions(userID: string): Promise<any[]> {
    const userRef = doc(this.firestore, `users/${userID}`);
    const userDoc = await getDoc(userRef);
    let existingData: any = {};
    if (userDoc.exists()) {
      existingData = userDoc.data();
    }

    if (!existingData.sessions) {
      existingData.sessions = [];
    }

    // Collect all sessions
    return existingData.sessions;
  }

  async getSavedSessionModulesForUser(userID: string): Promise<any[]> {
    const userRef = doc(this.firestore, `users/${userID}`);
    const userDoc = await getDoc(userRef);
    let existingData: any = {};

    if (userDoc.exists()) {
      existingData = userDoc.data();
    }

    if (!existingData.sessions) {
      existingData.sessions = [];
    }

    // Sortiere die Sitzungen nach dem letzten Studiumsdatum absteigend
    existingData.sessions.sort((a: any, b: any) => {
      const dateA = new Date(a.lastStudied);
      const dateB = new Date(b.lastStudied);
      return dateB.getTime() - dateA.getTime();
    });

    return existingData.sessions;
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


  //Loads External Modules
  loadExternalModule(): Observable<any> {
    const url: string = `${this.baseUrl}/load-all-modules`;
    return this.http.get<any>(url);
  }

  checkForUpdates(): Observable<{ updatesAvailable: boolean }> {
    const url = `${this.baseUrl}/check-updates`;
    return this.http.get<{ updatesAvailable: boolean }>(url);
  }
}
