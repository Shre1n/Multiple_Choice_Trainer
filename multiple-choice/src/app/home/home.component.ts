import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {GestureController, GestureDetail, IonicModule, NavController} from "@ionic/angular";
import {addIcons} from "ionicons";
import {personOutline,logOutOutline} from "ionicons/icons";
import {AuthService} from "../services/auth.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class HomeComponent implements OnInit{

  isLoggedIn!: boolean;


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private gestureCtrl: GestureController) {
    addIcons({personOutline, logOutOutline});
  }

  ngOnInit() {
    this.initializeSwipeGesture();
  }


  ionViewDidEnter(){
    this.authService.getCurrentUser()
    this.isLoggedIn = this.authService.isAuth();
  }

  async logout() {
    await this.authService.logout();
    await this.navCtrl.navigateRoot(['/home']);
  }

  openLoginForm(): void {
    this.router.navigate(['/login']);
    this.navCtrl.pop();
  }

  //Gesture to navigate to neighbor site from footer
  initializeSwipeGesture() {
    const content = document.querySelector('ion-content');
    if (content) {
      const gesture = this.gestureCtrl.create({
        el: content as HTMLElement,
        gestureName: 'swipe',
        onMove: ev => this.onSwipe(ev)
      });
      gesture.enable();
    } else {
      console.error('Ion content not found');
    }
  }

  onSwipe(ev: GestureDetail) {
    const deltaX = ev.deltaX;
    if (deltaX < -50) {
      this.router.navigate(['/statistik']);
    }
  }


}
