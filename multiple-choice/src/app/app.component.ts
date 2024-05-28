import { Component } from '@angular/core';
import {IonApp, IonContent, IonRouterOutlet} from '@ionic/angular/standalone';
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, HeaderComponent, FooterComponent, IonContent],
})
export class AppComponent {
  constructor() {}
}
