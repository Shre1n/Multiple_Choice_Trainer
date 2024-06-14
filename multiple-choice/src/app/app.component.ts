import { Component } from '@angular/core';
import {IonApp, IonContent, IonRouterOutlet} from '@ionic/angular/standalone';
import {FooterComponent} from "./footer/footer.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, FooterComponent, IonContent],

})
export class AppComponent {
  constructor(private router: Router) {}


}
