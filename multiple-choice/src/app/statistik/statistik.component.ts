import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import Chart from 'chart.js/auto';
import {ModuleModule} from "../module/module.module";
import {Card} from "../card/card.model";
import {options, today} from "ionicons/icons";
import ChartDataLabels from 'chartjs-plugin-datalabels';



@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.component.html',
  styleUrls: ['./statistik.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class StatistikComponent implements OnInit{

  public chart: any;

  modules: ModuleModule[] = [];
  cardsLvL0: Card[] = [];
  counter0: number = 0;
  cardsLvL1: Card[] = [];
  counter1: number = 0;
  cardsLvL2: Card[] = [];
  counter2: number = 0;
  cardsLvL3: Card[] = [];
  counter3: number = 0;
  cardsLvL4: Card[] = [];
  counter4: number = 0;
  cardsLvL5: Card[] = [];
  counter5: number = 0;
  cardsLvL6: Card[] = [];
  counter6: number = 0;

  testMyArray: Card[] = [];
  testAntworten: string[] = ['1', '2', '3'];




  constructor() {
//Testbefüllung von myCards
    var   card1= new Card('1 or 2', this.testAntworten, 0);
    var card2= new Card('1 or 2', this.testAntworten, 0);
    var card3= new Card('1 or 2', this.testAntworten, 0);
    var card4= new Card('1 or 2', this.testAntworten, 1);
    var card5= new Card('1 or 2', this.testAntworten, 4);
    var card6= new Card('1 or 2', this.testAntworten, 4  );
    var card7= new Card('1 or 2', this.testAntworten, 3);
    var card8= new Card('1 or 2', this.testAntworten, 4);
    var card9= new Card('1 or 2', this.testAntworten, 2);
    var card10= new Card('1 or 2', this.testAntworten, 5);
    var card11= new Card('1 or 2', this.testAntworten, 5);
    this.testMyArray.push(card1,card2,card3,card4,card5,card6, card7,card8);
// Ende

    this.ngOnInit();
  }

  ngOnInit(): void {
    this.cardSorter(this.testMyArray);
    this.createChart();
  }

  cardSorter(myCards: Card[]) {

    //für jeden Eintrag in dem array
    for(let i = 0; i < myCards.length; i++) {
      if(myCards[i].phase == 0){
        this.cardsLvL0[this.counter0] = myCards[i];
        this.counter0 ++;
      }else if(myCards[i].phase == 1){
        this.cardsLvL1[this.counter1] = myCards[i];
        this.counter1 ++;
      }else if(myCards[i].phase == 2){
        this.cardsLvL2[this.counter2] = myCards[i];
        this.counter2 ++;
      }else if(myCards[i].phase == 3){
        this.cardsLvL3[this.counter3] = myCards[i];
        this.counter3 ++;
      }else if(myCards[i].phase == 4){
        this.cardsLvL4[this.counter4] = myCards[i];
        this.counter4 ++;
      }else if(myCards[i].phase == 5){
        this.cardsLvL5[this.counter5] = myCards[i];
        this.counter5 ++;
      }else if(myCards[i].phase == 6){
        this.cardsLvL6[this.counter6] = myCards[i];
        this.counter6 ++;
      }else{

      }


    }
    this.counter0= 0;
    this.counter1= 0;
    this.counter2 = 0;
    this.counter3 = 0;
    this.counter4 = 0;
    this.counter5 = 0;
    this.counter6 = 0;


  }
  createChart(){
   // Chart.defaults.font.size = 32
    //Chart.register(ChartDataLabels);
/*
    Chart.defaults.set('plugins.datalabels', {
      color: '#FE777B'
    });
    */
    this.chart = new Chart("MyChart", {
     // plugins: [ChartDataLabels],

      type: 'pie',

      data: {
        labels: ['not started', 'Phase 1', 'Phase 2','Phase 3','Phase 4','Phase 5','Phase 6', ],

        datasets: [{
          //radius: 200,
          //label: 'My First Dataset',

          data: [this.cardsLvL0.length, this.cardsLvL1.length, this.cardsLvL2.length, this.cardsLvL3.length
            , this.cardsLvL4.length, this.cardsLvL5.length, this.cardsLvL6.length],

          backgroundColor: [
            'red',
            'pink',
            'yellow',
            'lightblue',
            'blue',
            'darkgreen',
            'green',
          ],

          hoverOffset: 4
        }],
      },

      options: {
        aspectRatio:2.5,
      },


    });
  }
}

