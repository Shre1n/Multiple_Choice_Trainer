import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  CollectionReference,
  DocumentData }
  from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

}
