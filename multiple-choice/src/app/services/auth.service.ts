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
import { Firestore, collection, doc, getDoc, setDoc } from "@angular/fire/firestore";
import { initializeApp } from "@angular/fire/app";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth;
  private currentUser: User | null = null;

  constructor(private firestore: Firestore) {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Registration error:', error);
        throw new Error(`Registration failed: ${error.message}`);
      } else {
        console.error('Unknown registration error');
        throw new Error('An unknown error occurred during registration.');
      }
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

  async getUserData(uid: string): Promise<any> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User not found');
    }
  }

  async saveUserAchievements(uid: string, achievements: any): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, { achievements }, { merge: true });
  }

  async getUserAchievements(uid: string): Promise<any[]> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data?.['achievements'] || [];
    } else {
      throw new Error('User not found');
    }
  }
}
