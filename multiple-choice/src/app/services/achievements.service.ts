import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import {collection, doc, Firestore, getDoc, setDoc, updateDoc} from "@angular/fire/firestore";
import {user} from "@angular/fire/auth";
import {logoFacebook} from "ionicons/icons";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  img: string
}

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private baseUrl = 'http://localhost:8888/achievements';
  private achievements: Achievement[] = [];

  constructor(private http: HttpClient, private firestore: Firestore) {}


  // Load all achievements from the server
  getAllServerAchievements(): Observable<Achievement[]> {
    const url = `${this.baseUrl}`;
    return this.http.get<Achievement[]>(url);
  }

  async getUserAchievements(userID: string): Promise<Achievement[]> {
    try {
      const docRef = await getDoc(doc(this.firestore, `users/${userID}`));
      if (docRef.exists()) {
        const data = docRef.data();
        this.achievements = data['serverAchievements']['achievements'] || [];
        return Object.values(this.achievements)
          .filter((achievement: Achievement) => achievement.achieved)
          .map((achievement: Achievement) => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            achieved: achievement.achieved,
            img: achievement.img
          }));

      }else {
        console.error(`No document found for user ${userID}`);
        return []; // Return an empty array if document does not exist
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }


  async getAchievements(userID: string): Promise<Achievement[]> {
    try {
      const docRef = await getDoc(doc(this.firestore, `users/${userID}`));
      if (docRef.exists()) {
        const data = docRef.data();
        this.achievements = data['serverAchievements']['achievements'] || [];
        return Object.values(this.achievements)
          .filter((achievement: Achievement) => !achievement.achieved)
          .map((achievement: Achievement) => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            achieved: achievement.achieved,
            img: achievement.img
          }));

      }else {
        console.error(`No document found for user ${userID}`);
        return []; // Return an empty array if document does not exist
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async initAchivements(userID: string){
    const serverAchievements = await this.getAllServerAchievements().toPromise();
    const userRef = doc(this.firestore, `users/${userID}`);
    try{
     await setDoc(userRef, {
       serverAchievements
     }, { merge: true });
    }catch (error) {
      console.log(error)
    }
  }

  async setIndexAchievement(userID: string, index: number) {
    const userRef = doc(this.firestore, `users/${userID}`);
    try{
      // Hole die aktuellen Daten des Benutzers
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData) {
        const serverAchievements = userData['serverAchievements'] || {};

        // Überprüfen, ob das Achievement bereits erreicht wurde
        if (serverAchievements.achievements[index].achieved) {
          return;
        }

        const updatedAchievements = {
          ...serverAchievements,
          achievements: {
            ...serverAchievements.achievements,
            [index]: {
              ...serverAchievements.achievements[index],
              achieved: true
            }
          }
        };
        await updateDoc(userRef, {
          serverAchievements: updatedAchievements
        });

      } else {
        console.error(`Benutzer ${userID} nicht gefunden.`);
        // No User found maybe throw error to frontend
      }
    } catch (error){
      console.log(error)
    }
  }

  // Get a specific achievement by ID
  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }
}
