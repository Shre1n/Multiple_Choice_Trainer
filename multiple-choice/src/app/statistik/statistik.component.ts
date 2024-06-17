import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import Chart from 'chart.js/auto';


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




  constructor() {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.createChart();
  }


  createChart(){

    this.chart = new Chart("MyChart", {
      type: 'pie', //this denotes tha type of chart

      data: {
        labels: ['not started', 'Phase 1', 'Phase 2','Phase 3','Phase 4','Phase 5','Phase 6', ],
        datasets: [{
          label: 'My First Dataset',
          data: [500, 300, 240, 100, 432, 253, 34],
          backgroundColor: [
            'pink',
            'darkblue',
            'lightblue',
            'green',
            'yellow',
            'orange',
            'blue',
          ],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio:2.5
      }

    });
  }
}

