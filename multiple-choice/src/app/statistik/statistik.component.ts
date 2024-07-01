import { Component, OnInit } from '@angular/core';
import {GestureController, GestureDetail, IonicModule} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";

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

  //wichtig
  wrongAnswers: number = 5;
  kartenInsgesammt: number = 10;
  kartenRichtig: number = 5;
  prozErfolg: number = 0;

  constructor(private router: Router,
              private gestureCtrl: GestureController,
              //wichtig
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.initializeSwipeGesture();
    this.wrongAnswers = +this.route.snapshot.paramMap.get('wrongAnswers')!;  }



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

  goToHome() {
    this.router.navigate(['/card-list']);
  }
}
