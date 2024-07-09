import { NavController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Component,  OnInit,  } from '@angular/core';
import { IonicModule} from "@ionic/angular";
import {FooterComponent} from "../footer/footer.component";
import {addIcons} from "ionicons";
import {logOutOutline, shareSocialOutline} from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {AchievementsService} from "../services/achievements.service";
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import {Share} from '@capacitor/share';
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";
import {NgForOf, NgIf} from "@angular/common";
import ChartDataLabels from 'chartjs-plugin-datalabels';

//neded for chart
Chart.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels);

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.component.html',
  styleUrls: ['./statistik.component.scss'],
  imports: [
    IonicModule,
    FooterComponent,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class StatistikComponent implements OnInit{

  isLoggedIn!: boolean;

  counter0: number = 0;
  counter1: number = 0;
  counter2: number = 0;
  counter3: number = 0;
  counter4: number = 0;
  counter5: number = 0;
  counter6: number = 0;
  anzModule: number = 0;

  public chart: any;
  public charts: any[] = [];

  i: number = 0;
  answers: string[] = [];
  categories: string[] = [];
  modules: any[] = [];

  numberAllCards: number = 0;
  wrongAnswers: number = 0;
  answeredCorrectlyCount: number = 0;
  category: string = '';
  usierIDstring: string = "";
  sessions: any;

    x: number = 0;
    chartsName: string[] = [];
    abgeschlosseneModule: String[] = [];
    fortschrittProzent: number = 0;


  //constructor of statistics
  constructor(private router: Router,
              private route: ActivatedRoute,
              public navCtrl: NavController,
              private achievements: AchievementsService,
              private moduleService: ModuleService,
              private toastController: ToastController,
              private authService: AuthService, ) {
    addIcons({logOutOutline,shareSocialOutline})
    this.isLoggedIn = this.isAuth();

  }

  //calling when opening the page
  ngOnInit() {
    this.wrongAnswers = +this.route.snapshot.paramMap.get('wrongAnswers')!;
    this.loadModules();
    this.resetAnzModule()
    this.loadUserSessions()
  }

  //reloads the statistics page if data has changed
  reloadPage() {
    this.router.navigate(['/statistik'], { replaceUrl: true });
  }
  //resets this.anzModule
  async resetAnzModule(){
    this.anzModule = 0;
  }

  //loads modules
  async loadModules() {
    this.moduleService.loadExternalModule().subscribe({
      next: response => {
        this.modules = response;
        this.extractCategories(response);
      },
      error: error => {
        console.error('Error loading modules:', error);
        this.presentToast('No Connection to External Server! :(', 'middle');
      }
    });
  }

  async presentToast(message: string, position: 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 10000,
      position: position,
    });
    await toast.present();
  }

  //checks whether the user is logged in
  isAuth(): boolean {
    return this.authService.isAuth();
  }

  //loads sessions from user
  async loadUserSessions() {
    const user = await this.authService.getCurrentUser();
    this.usierIDstring = user?.uid as string;
    this.sessions= await this.moduleService.getUserSessions(this.usierIDstring);
    this.getSessionDatas();
  }

  //gets the data of the user to generate the statistics
  async getSessionDatas() {
    let index = 0;
    let totalIncorrectAnswers = 0;
    this.sessions.forEach((category: any) => {
      if (category.modules && Array.isArray(category.modules)) {
        category.modules.forEach((module: any) => {
          this.numberAllCards++;
          if (module.answeredIncorrectlyCount) {
            totalIncorrectAnswers += module.answeredIncorrectlyCount;
          }
          if(module.answeredCorrectlyCount==0){
            this.counter0++
          }else if(module.answeredCorrectlyCount==1){
            this.counter1++
          }else if(module.answeredCorrectlyCount==2){
            this.counter2++
          }else if(module.answeredCorrectlyCount==3){
            this.counter3++
          }else if(module.answeredCorrectlyCount==4){
            this.counter4++
          }else if(module.answeredCorrectlyCount==5){
            this.counter5++
          }else if(module.answeredCorrectlyCount==6){
            this.counter6++
          }else {
            console.log('module.answeredCorrectlyCount out of border:',module.answeredCorrectlyCount);
          }
        });
      }
    });
    this.sessions.forEach((category: any) => {
      if (category.modules && Array.isArray(category.modules)) {
        category.modules.forEach((module: any) => {
          if (module.answeredIncorrectlyCount) {
            totalIncorrectAnswers += module.answeredIncorrectlyCount;
          }
        });
      }
      this.x++;
    });
      this.sessions.forEach((category: any) => {
        let richtig = 0;
        let falsch = 0;
        this.chartsName[this.i] = category.category;
        this.anzModule++;
        let modulKarten:number = 0;
        let modulKartenAbgeschlossen: number = 0;
        category.modules.forEach((module: any) => {
          modulKarten++;

          if(module.answeredCorrectlyCount==0){
            falsch++
          }else if(module.answeredCorrectlyCount==1){
            falsch++
          }else if(module.answeredCorrectlyCount==2){
            falsch++
          }else if(module.answeredCorrectlyCount==3){
            falsch++
          }else if(module.answeredCorrectlyCount==4){
            falsch++
          }else if(module.answeredCorrectlyCount==5){
            falsch++
          }else if(module.answeredCorrectlyCount==6){
            richtig++
            modulKartenAbgeschlossen++
          }else {
            console.log('module.answeredCorrectlyCount out of border:',module.answeredCorrectlyCount);
          }
        });
        if(modulKarten == modulKartenAbgeschlossen){
          this.abgeschlosseneModule[index] = category.category;
          index++;
        }
        modulKarten=0;
        modulKartenAbgeschlossen = 0;
      });
    this.createPieChart();
    let zahl =(this.counter6/this.numberAllCards)*100;
    this.fortschrittProzent = parseFloat(zahl.toFixed(2))
  }

  //extracts categories
  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
  }

  //shares statistic
  shareALL(){
    const textBody =
      'Hey, sieh dir meine Leistung an: ' + '\n'
      + 'Von meinen ' + this.anzModule + ' Modulen habe ich ' + this.abgeschlosseneModule + ' bereits komplett gelernt!' +'\n'
      + 'Von ' + this.numberAllCards + " Karten habe ich schon " + this.counter6 + 'absolviert.' + '\n' + '\n'
      + 'Gelernt mit dem Multiple-Choice Trainer';
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

  //deletes the existing chart in case of updates
  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }

  //creates a chart
  createPieChart() {
    var ctx = (document.getElementById('myCanvas0') as any).getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Abgeschlossen: ','noch nicht gemeistert: '],
          datasets: [{
            data: [this.counter6, this.counter0+ this.counter1+this.counter3+this.counter2+this.counter4+this.counter5],
            backgroundColor: [ '#91A6C0', '#5A7699','#2D496B']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: '#fff',
              display: true
            }
          }
        }
      });
    } else {
      console.error('Canvas context is not available.');
    }
    this.charts.push(this.chart);
  }

  //log out the user
  async logout() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 7);
    }
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/landingpage']);
  }
}
