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
import {Achievement, AchievementsService} from "./achievements.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // User from firestore
  private currentUser: User | null = null;
  // is user logged in
  isLoggedIn: boolean = false;

  constructor(private firestore: Firestore,
              private auth: Auth,
              private achievements: AchievementsService) {
    const firebaseApp = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(firebaseApp);

    // Subscribe to auth state changes to update currentUser
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  async getCurrentUser(){
    try {
      // set user to null or this.currentUser after Promise
      this.currentUser = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          unsubscribe();
          // user Object
          resolve(user);
        });
      });
      return this.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async getCurrentUserId() {
    // get userID
    if (this.currentUser) {
      return this.currentUser.uid;
    } else {
      return null;
    }
  }

  async resetPassword(email: string){
    //resets the Password with mail
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

  async login(email: string, password: string){
    // login function for logging in the user
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      localStorage.setItem('isLoggedIn', 'true');
      const user = userCredential.user;
      this.currentUser = user;
      return user;
    } catch (error) {
      //in case of error -> message
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during login.');
      }
    }
  }

  // check current Auth state of user
  isAuth(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  async register(email: string, password: string, additionalData: any){
    //register data to firestore
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await this.saveUserData(user, additionalData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(){
    // logout from App and clear storage entry if exist
    try {
      await signOut(this.auth);
      localStorage.removeItem('isLoggedIn');
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
    //saves userdata to firestore
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, { email: user.email, ...additionalData });
  }

}
