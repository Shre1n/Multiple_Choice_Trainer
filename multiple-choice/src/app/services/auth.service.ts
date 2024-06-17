import {Injectable} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User
} from '@angular/fire/auth';
import {doc, Firestore, setDoc} from "@angular/fire/firestore";
import {initializeApp} from "@angular/fire/app";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
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
  isLoggedIn: boolean = false;

  constructor(private firestore: Firestore, private auth: Auth) {
    const firebaseApp = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(firebaseApp);

    // Subscribe to auth state changes to update currentUser
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  getAuth(): Auth {
    return this.auth;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      this.currentUser = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
      return this.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
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
      localStorage.setItem('isLoggedIn', 'true');
      const user = userCredential.user;
      this.currentUser = user;
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during login.');
      }
    }
  }

  // Methode, um den aktuellen Anmeldestatus abzurufen
  isAuth(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
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
      localStorage.setItem('isLoggedIn', 'false');
      this.currentUser = null;
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
