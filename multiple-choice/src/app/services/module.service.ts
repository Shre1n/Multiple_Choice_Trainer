import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  collection,
  CollectionReference, deleteDoc,
  doc,
  DocumentData,
  Firestore, getDoc,
  getDocs, orderBy,
  query,
  setDoc, updateDoc
} from "@angular/fire/firestore";
import {ModuleModule} from "../module/module.module";
import {environment} from "../../environments/environment.prod";
import {AuthService} from "./auth.service";
import {AchievementsService} from "./achievements.service";


@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private correctSteak!: number;

  private baseUrl = "http://localhost:8888";

  constructor(private http: HttpClient,
              private firestore: Firestore,
              private authService: AuthService,
              private achievements: AchievementsService) {
  }

  async checkForSessions () {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) throw new Error('User document not found');
      const userData = userDoc.data();
      if (userData['sessions'].length == 5) {
        await this.achievements.setIndexAchievement(user.uid, 10);
      }
    }
  };


  async getDataForUpdate(category: string): Promise<any> {
    // Fetch user data and filter modules based on category
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) throw new Error('User document not found');
      const userData = userDoc.data();

      // Check if the field 'selfmademodules' exists in the user document and is an array.
      const modulesData = userData && Array.isArray(userData['selfmademodules']) ? userData['selfmademodules'] : [];

      //Filtering the modules based on the specified category
      const filteredModules = modulesData.filter((module: any) => module.category === category);
      return filteredModules;


    }
  }

  async sortModulesByLastStudied(userSessions: any[]): Promise<void> {
    // Sort user sessions by last studied date in descending order
    userSessions.forEach(session => {
      session.modules.sort((a: { lastStudied: string | number | Date; }, b: { lastStudied: string | number | Date; }) => {
        const dateA = new Date(a.lastStudied);
        const dateB = new Date(b.lastStudied);
        return dateB.getTime() - dateA.getTime();
      });
    });
  }

  async renderUserCategories(): Promise<string[]> {
    // Render categories of user-made modules sorted alphabetically
    const user = await this.authService.getCurrentUser();
    if (user) {

      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      let existingData: any = {};
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData['selfmademodules']) {
          // Extract only the categories of the modules and sort them alphabetically.
          let categories = userData['selfmademodules']
            .map((module: any) => module.category)
            //new Intl.Collator is used to compare large amounts of strings which is possible in app
            .sort(new Intl.Collator('de').compare);
          return categories;
        }
      }
      return [];
    } else {
      // Return an empty array if user is not logged in
      return [];
    }
  }

  async getSavedModulesForUser(): Promise<any[]> {
    // Fetch saved modules for the logged-in user
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      let existingData: any = {};
      if (userDoc.exists()) {
        existingData = userDoc.data();
      }

      if (!existingData.selfmademodules) {
        existingData.selfmademodules = [];
      }

      // Collect all modules from all sessions
      let savedModules: any[] = [];
      existingData.selfmademodules.forEach((module: any) => {
        savedModules.push(module);
        console.log(module.correctAnswers);
      });
      return savedModules;
    } else {
      // Return an empty array if user is not logged in
      return [];
    }
  }

  async deleteUserModule(category: { category: string }): Promise<void> {
    // Delete user module based on category
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
        await updateDoc(userRef, { selfmademodules: existingData.selfmademodules });
        console.log('Module deleted successfully');
      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  }

  async saveUserModulesToFirestore(moduleData: any): Promise<void> {
    // Save user modules to Firestore
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

        let categoryFound = false;
        console.log("Data:", moduleData)
        for (let i = 0; i < existingData.selfmademodules.length; i++) {
          if (existingData.selfmademodules[i].category === moduleData.category) {
            existingData.selfmademodules[i].modules.push(...moduleData.modules);
            categoryFound = true;
            break;
          }
        }

        if (!categoryFound) {
          existingData.selfmademodules.push(moduleData);
          console.log(moduleData);
        }

        await setDoc(userRef, existingData, { merge: true });
      } catch (error) {
        console.error('Error saving module:', error);
      }
    }
  }

  async updateUserModuleInFirestore(updatedQuestion: any, category: string, questionIndex: number): Promise<void> {
    // Update user module in Firestore
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) throw new Error('User document not found');
        const data = userDoc.data();

        // Find the index of the module with the matching category
        const modules = data['selfmademodules'] || [];
        const moduleIndex = modules.findIndex((mod: any) => mod.category === category);

        if (moduleIndex !== -1) {
          // Update the specific question within the module
          const module = modules[moduleIndex];
          if (module && module.modules && module.modules[questionIndex]) {
            module.modules[questionIndex] = updatedQuestion;
            await updateDoc(userRef, { selfmademodules: modules });
          } else {
            console.error('Question not found for the specified index');
          }
        } else {
          console.error('Module not found for the specified category');
        }
      } catch (error) {
        console.error('Error updating module:', error);
      }
    }
  }

  async deleteQuestion(category: string, questionIndex: number): Promise<void> {
    // Delete question from user module in Firestore
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) throw new Error('User document not found');
        const data = userDoc.data();

        // Find the index of the module with the matching category
        const modules = data['selfmademodules'] || [];
        const moduleIndex = modules.findIndex((mod: any) => mod.category === category);

        if (moduleIndex !== -1) {
          // Remove the specific question from the module
          const module = modules[moduleIndex];
          if (module && module.modules && module.modules[questionIndex]) {
            module.modules.splice(questionIndex, 1);
            // Update the Firestore document
            await updateDoc(userRef, { selfmademodules: modules });
            console.log('Question deleted successfully');
          } else {
            console.error('Question not found for the specified index');
          }
        } else {
          console.error('Module not found for the specified category');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  }



  async saveSession(userID: string, sessionData: any) {
    // Save Session in firestore
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

        // Category already exists, update answeredCorrectlyCount and answeredIncorrectlyCount.
        const existingSessionIndex = existingData.sessions.findIndex((session: any) => session.category === sessionData.category);

        if (existingSessionIndex !== -1) {
          // Category exists already, update answeredCorrectlyCount and answeredIncorrectlyCount.
          sessionData.modules.forEach((newModule: any) => {
            const existingModuleIndex = existingData.sessions[existingSessionIndex].modules.findIndex((module: any) => module.question === newModule.question);
            if (existingModuleIndex !== -1) {
              existingData.sessions[existingSessionIndex].modules[existingModuleIndex].answeredCorrectlyCount += newModule.answeredCorrectlyCount;
              existingData.sessions[existingSessionIndex].modules[existingModuleIndex].answeredIncorrectlyCount += newModule.answeredIncorrectlyCount;
              existingData.sessions[existingSessionIndex].modules[existingModuleIndex].correctStreak += newModule.correctStreak;
              this.setStreak(existingData.sessions[existingSessionIndex].modules[existingModuleIndex].correctStreak);
              if (newModule.correctStreak === 0) {
                existingData.sessions[existingSessionIndex].modules[existingModuleIndex].correctStreak = 0;
                this.setStreak(0);
              }
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
        return
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } else {
      console.error('No user is logged in');
    }
  }

  async getCorrectStreakOfModule(category: string) {
    // get Streak of user module
    const modulesInfo: {index: number; question: string;}[] = [];
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      try {

        const userDoc = await getDoc(userRef);
        let existingData: any = {};
        if (userDoc.exists()) {
          existingData = userDoc.data();
        }

        if (!existingData.sessions) {
          existingData.sessions = [];
        }

        if (existingData.sessions) {
          existingData.sessions.forEach((session: any) => {
            if(session.category === category)
            session.modules.forEach((module: any, index: number) => {
              // Überprüfen, ob die correctStreak >= 6 ist
              if (module.correctStreak >= 6) {
                modulesInfo.push({
                  index: index,
                  question: module.question,
                });
              }
            });
          });
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }else {
      console.error('No user is logged in');
    }
    return modulesInfo;
  }

  //Sets the streak to 0 if necessary
  //Basically a methode to control Streak
  setStreak(streak: number) {
    this.correctSteak = streak;
  }

  async getUserSessions(userID: string): Promise<any[]> {
    // get all sessions
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

  async getSavedSessionModulesForUser(userID: string){
    // collect saved modules for sorting timeStamp
    const userRef = doc(this.firestore, `users/${userID}`);
    const userDoc = await getDoc(userRef);
    let existingData: any = {};

    if (userDoc.exists()) {
      existingData = userDoc.data();
    }

    if (!existingData.sessions) {
      existingData.sessions = [];
    }

    // Sort sessions by the last study date in descending order.
    existingData.sessions.sort((a: any, b: any) => {
      const dateA = new Date(a.lastStudied);
      const dateB = new Date(b.lastStudied);
      return dateB.getTime() - dateA.getTime();
    });

    return existingData.sessions;
  }


  //Loads External Modules
  loadExternalModule(): Observable<any> {
    const url: string = `${this.baseUrl}/load-all-modules`;
    return this.http.get<any>(url);
  }

  //check for updates in External Server Modules
  checkForUpdates(): Observable<{ updatesAvailable: boolean }> {
    const url = `${this.baseUrl}/check-updates`;
    return this.http.get<{ updatesAvailable: boolean }>(url);
  }
}
