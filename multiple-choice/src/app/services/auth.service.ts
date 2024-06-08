import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {addDoc, collection, doc, Firestore, getDoc, setDoc} from "@angular/fire/firestore";
import { User } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore) {}

  // async createSession(userId: string, module: string, cards: string[]): Promise<void> {
  //   try {
  //
  //     const selectedCards = this.shuffle(allCards).slice(0, 30);
  //
  //     // Füge eine neue Lernsession für den Benutzer hinzu
  //     const sessionRef = await addDoc(collection(this.firestore, `users/${userId}/sessions`), {
  //       module: module,
  //       cards: selectedCards,
  //       // Hier kannst du weitere Session-Daten hinzufügen, die du speichern möchtest
  //     });
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       throw new Error(`Create session: ${error.message}`);
  //     }
  //   }
  // }
  //
  // // Funktion zum Mischen von Karten (Fisher-Yates Algorithmus)
  // private shuffle(cards: string[]): string[] {
  //   let currentIndex = cards.length;
  //   let randomIndex: number;
  //
  //   while (currentIndex !== 0) {
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex--;
  //
  //     [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  //   }
  //
  //   return cards;
  // }


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
        throw new Error(`Registration failed: ${error.message}`);
      } else {
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
