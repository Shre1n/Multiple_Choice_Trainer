import { Component, OnInit } from '@angular/core';
import {GestureDetail, IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class CardListComponent  implements OnInit {

  constructor(private router:Router) {
  }

  ngOnInit() {
  }


  onSwipe(ev: GestureDetail) {
    const deltaX = ev.deltaX;
    if (deltaX < -50) {
      this.router.navigate(['/statistik']);
    }else {
      if (deltaX < 50) {
        this.router.navigate(['/achivements'])
      }
    }
  }
}

