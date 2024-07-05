import { Component, OnInit } from '@angular/core';
import {GestureController, GestureDetail, IonicModule} from "@ionic/angular";
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";
import {Router} from "@angular/router";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class CardComponent implements OnInit{

  modules: any[] = [];
  errorMessage: string = 'No Connection to External Server! 😢';

  constructor(private router: Router,private moduleService: ModuleService,
              private toastController: ToastController,
              private gestureCtrl: GestureController) { }

  ngOnInit(): void {
    this.loadModules();
    this.checkForUpdates();

  }

  async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }



  checkForUpdates(): void {
    this.moduleService.checkForUpdates().subscribe(
      (response) => {
        if (response.updatesAvailable) {
          console.log('Updates available, reloading modules...');
        } else {
          console.log('No updates available');
        }
      },
      (error) => {
        console.error('Error checking for updates:', error);
      }
    );
  }

  loadModules(): void {
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('middle');
      }
    );
  }


}
