import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {addDoc, collection, doc, Firestore, getDoc, setDoc} from "@angular/fire/firestore";
import { User } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore) {}

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


  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during login.');
      }
    }
  }

  async register(email: string, password: string, additionalData: any) {
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

  async logout() {
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

  private async saveUserData(user: User, additionalData: any) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, { email: user.email, ...additionalData });
  }

  async getUserData(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User not found');
    }
  }


}
