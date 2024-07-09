import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { doc, Firestore, getDoc, setDoc, updateDoc} from "@angular/fire/firestore";

// Interface to define the structure of an Achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon:string
}

@Injectable({
  // The service is available throughout the application
  providedIn: 'root'
})
export class AchievementsService {
  // Base URL for server requests
  private baseUrl = 'http://localhost:8888/achievements';
  private achievements: Achievement[] = [];

  constructor(private http: HttpClient, private firestore: Firestore) {}


  // Load all achievements from the server
  getAllServerAchievements(): Observable<Achievement[]> {
    const url = `${this.baseUrl}`;
    return this.http.get<Achievement[]>(url);
  }

  // Load the achievements of a specific user
  async getUserAchievements(userID: string): Promise<Achievement[]> {
    try {
      // Reference to the user document
      const docRef = await getDoc(doc(this.firestore, `users/${userID}`));
      if (docRef.exists()) {
        const data = docRef.data();
        this.achievements = data['serverAchievements']['achievements'] || [];
        return Object.values(this.achievements)
          // Filter only achieved achievements
          .filter((achievement: Achievement) => achievement.achieved)
          .map((achievement: Achievement) => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            achieved: achievement.achieved,
            icon: achievement.icon,
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

// Load the unachieved achievements of a specific user
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
            icon: achievement.icon,
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

  // Set the status of a specific achievement to 'achieved'
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

        // Check if the achievement has already been achieved
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
        // Update the user document with the new achievements
        await updateDoc(userRef, {
          serverAchievements: updatedAchievements
        });

      } else {
        // No user found, maybe throw an error to the frontend
        console.error(`Benutzer ${userID} nicht gefunden.`);
      }
    } catch (error){
      console.log(error)
    }
  }
}
