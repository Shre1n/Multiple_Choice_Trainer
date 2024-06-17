import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {IonicModule, NavController} from "@ionic/angular";
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
export class HomeComponent{

  isLoggedIn!: boolean;


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,) {
    addIcons({personOutline, logOutOutline});
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


}
