import { Component } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonRouterOutlet,
  IonToolbar
} from '@ionic/angular/standalone';
import {FooterComponent} from "./footer/footer.component";
import {Router} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, FooterComponent, IonContent, IonHeader, HomeComponent, IonToolbar, IonButtons, IonButton],

})
export class AppComponent {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Überwache den Anmeldestatus
    this.authService.getCurrentUser().then(user => {
      this.authService.isAuth() ? this.authService.isAuth() : null
    });
  }


}
