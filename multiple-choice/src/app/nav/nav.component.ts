import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {homeSharp, statsChartSharp, bookSharp, trophySharp}  from "ionicons/icons";
import {addIcons} from "ionicons";
import {Router} from "@angular/router";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class NavComponent  implements OnInit {

  constructor(private router: Router) {
    addIcons({homeSharp, statsChartSharp, bookSharp, trophySharp})
  }


  navToHome(){
    this.router.navigate([''])
  }

  navToStatistik(){
    this.router.navigate(['/statistik'])
  }

  navToCards(){
    this.router.navigate(['/cards'])
  }

  navToAchivements(){
    this.router.navigate(['/achivements'])
  }





  ngOnInit() {}

}
