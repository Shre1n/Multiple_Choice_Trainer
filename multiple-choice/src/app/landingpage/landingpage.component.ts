import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule, NgForm} from "@angular/forms";
import {IonicModule, NavController} from "@ionic/angular";

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class LandingpageComponent  implements OnInit {

  constructor(  private router: Router,  )
  { }

  ngOnInit() {

  }

  openLoginComponent():void{
    this.router.navigate(['/login']);
  }
  openRegisterComponent():void{
    this.router.navigate(['/register']);
  }
}
