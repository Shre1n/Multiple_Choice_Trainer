import {Component, OnInit} from '@angular/core';
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
export class HomeComponent implements OnInit{

  isLoggedIn: boolean = false;


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,) {
    addIcons({personOutline, logOutOutline});
  }

  ngOnInit() {
    this.checkLoginStatus();
  }


  checkLoginStatus() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = user !== null;
    console.log(this.isLoggedIn)
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/home']);
  }

  openLoginForm(): void {
    this.router.navigate(['/login']);
    this.navCtrl.pop();
  }


}
