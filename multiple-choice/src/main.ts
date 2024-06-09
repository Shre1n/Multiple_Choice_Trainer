
import {enableProdMode} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Importiere AngularFireAuthModule


import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import {environment} from 'src/environments/environment';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {getAuth, provideAuth} from "@angular/fire/auth";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAuth(() => getAuth()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
