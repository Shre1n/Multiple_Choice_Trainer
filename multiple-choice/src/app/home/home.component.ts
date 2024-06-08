import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import {IonicModule, NavController} from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class HomeComponent {

  constructor(private router: Router, public navCtrl: NavController) { }


  openRegisterForm(): void {
    this.router.navigate(['/register']);
  }

}
