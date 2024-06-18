import { Component, OnInit } from '@angular/core';
import {GestureController, GestureDetail, IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";

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

  constructor(private router: Router,
              private gestureCtrl: GestureController) { }

  ngOnInit() {
    this.initializeSwipeGesture();
  }


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
