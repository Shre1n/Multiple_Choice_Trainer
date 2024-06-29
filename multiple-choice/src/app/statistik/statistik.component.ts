import { Component, OnInit } from '@angular/core';
import {GestureController, GestureDetail, IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";

import {ModuleModule} from "../module/module.module";
import {CardComponent} from "../card/card.component";
import {Card} from "../card/card.model";
import { Chart, registerables  } from 'chart.js';
import {Share} from '@capacitor/share';
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";
//import * as module from "node:module";



//import {AnyComponentStyleBudgetChecker} from "@angular-devkit/build-angular/src/tools/webpack/plugins";

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.component.html',
  styleUrls: ['./statistik.component.scss'],
  imports: [
    IonicModule,
    FooterComponent
  ],
  standalone: true
})
export class StatistikComponent implements OnInit{

  myCards: Card[]=[];

  counter0: number = 0;
  counter1: number = 0;
  counter2: number = 0;
  counter3: number = 0;
  counter4: number = 0;
  counter5: number = 0;
  counter6: number = 0;

  anzModule: number = 0;
  anzCards: number = 0;
  anzAchievements: number = 3;
  anzMaxAchievements: number = 6;
  anzNotDoneCards: number = 0;


  public chart: any;
  i: number = 0;
  answers: string[] = [];

  //server
  categories: string[] = [];
  errorMessage: string = 'No Connection to External Server! :cry:';
  modules: ModuleModule[] = [];


  constructor(private router: Router,
              private gestureCtrl: GestureController,
              private moduleService: ModuleService,
              private toastController: ToastController,
  ) {
    Chart.register(...registerables);

  this.counter0=4;
  this.counter1=6;
  this.counter2=7;
  this.counter3=4;
  this.counter4=5;
  this.counter5=2;
  this.counter6=4;
  this.anzNotDoneCards = this.counter0+ this.counter1+this.counter2+this.counter3+this.counter4+this.counter5;
  }

  ngOnInit() {
    this.initializeSwipeGesture();
    this.createPieChart();
    this.loadModules();
    this.fillStatisticData
  }

  shareTest(){
    console.log(
      this.modules
      //'Hey, sieh dir meine Leistung an: ' + '\n' + 'Von meinen ' + this.anzModule + ' Modulen habe ich ' + this.counter6 + ' bereits komplett gelernt!' +'\n'
    );
  }

  async fillStatisticData(){
    this.anzModule = 0;
  }

  async loadModules(){
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
        this.extractCategories(response);
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('middle');
      }
    );
  }
  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
    this.anzModule = this.categories.length;
  }async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }


  share(){
    const textBody = //this.modules.map(module => {return 'moin';}).join('\n');
      'Hey, sieh dir meine Leistung an: ' + '\n'
      + 'Von meinen ' + this.anzModule + ' Modulen habe ich ' + this.counter6 + ' bereits komplett gelernt!' +'\n';
    //let msgText = `Hallo, \n` + textBody;

    Share.canShare().then(canShare => {
      if (canShare.value) {
        Share.share({
          title: 'Meine Studienleistungen',
          text: textBody,
          dialogTitle: 'Leistungen teilen'
        }).then((v) => console.log('ok: ', v))
          .catch(err => console.log(err));
      } else {
        console.log('Error: Sharing not available!');
      }
    });

  }


  createPieChart() {
    this.chart = new Chart('MyChart', {
      type: 'pie',
      data: {
        labels: ['Stufe 0','Stufe 1','Stufe 2','Stufe 3','Stufe 4','Stufe 5','Stufe 6'],
        datasets: [{
          label: 'My First Dataset',
          data: [this.counter0, this.counter1, this.counter2, this.counter3, this.counter4, this.counter5,this.counter6],
          backgroundColor: [
            '#a20f0f',
            '#173356',
            '#2D496B',
            '#5A7699',
            '#91A6C0',
            '#CEDBEB',
            '#3dbe19'
          ],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw || '';
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }

    /*
    var ctx = (document.getElementById('myPieChart') as any).getContext('2d');
    var myPieChart = new Chart(ctx, {
    //this.chart = new Chart(ctx, {
    //this.chart = new Chart("MyChart", {
      type: 'pie',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
          data: [300, 50, 100],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
*/

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
      this.router.navigate(['/card-list']);
    }else{
      if (deltaX < 50){
        this.router.navigate(['']);
      }
    }
  }
}
