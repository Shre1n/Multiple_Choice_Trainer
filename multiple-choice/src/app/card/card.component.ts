import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";

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

  constructor(private moduleService: ModuleService, private toastController: ToastController) { }

  ngOnInit(): void {

  }

  async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }




}
