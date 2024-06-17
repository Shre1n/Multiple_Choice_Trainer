import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  sendPasswordResetEmail,
  getAuth,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import {Firestore, collection, doc, getDoc, setDoc, updateDoc} from "@angular/fire/firestore";
import { initializeApp } from "@angular/fire/app";
import { environment } from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable } from "rxjs";
import {Achievement} from "./achievements.service";

interface AchievementsResponse {
  achievements: {
    [key: string]: Achievement; // Jeder Key ist eine Achievement-ID, Wert ist ein Achievement-Objekt
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth, private http: HttpClient) {
    const firebaseApp = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(firebaseApp);

    // Subscribe to auth state changes to update currentUser
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  getAuth(): Auth {
    return this.auth;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser === null) {
      this.currentUser = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    }
    return this.currentUser;
  }

  async getCurrentUserId(): Promise<string | null> {
    if (this.currentUser) {
      return this.currentUser.uid;
    } else {
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Password reset failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during password reset.');
      }
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log("User Logged in: ", userCredential);
      return userCredential.user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during login.');
      }
    }
  }

  async register(email: string, password: string, additionalData: any): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await this.saveUserData(user, additionalData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during logout.');
      }
    }
  }

  private async saveUserData(user: User, additionalData: any): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, { email: user.email, ...additionalData });
  }

}
