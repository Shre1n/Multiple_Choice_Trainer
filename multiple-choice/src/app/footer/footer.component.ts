import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {homeSharp, statsChartSharp, bookSharp, trophySharp} from "ionicons/icons";
import {addIcons} from "ionicons";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class FooterComponent  implements OnInit {

  constructor(private router: Router) {
    addIcons({homeSharp, statsChartSharp, bookSharp, trophySharp})

  }

  ngOnInit() {}


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


}
