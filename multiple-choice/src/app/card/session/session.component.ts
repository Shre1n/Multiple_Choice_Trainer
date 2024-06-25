import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from "@ionic/angular";
import { ModuleService } from "../../services/module.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgClass, Location } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import {addIcons} from "ionicons";
import {close} from "ionicons/icons";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  imports: [IonicModule, FormsModule, NgClass],standalone:true
})
export class SessionComponent  implements OnInit {

  category: string = '';
  modules: any[] = [];
  currentIndex: number = 0;
  showCorrectAnswers: boolean = false;
  selectedAnswer: string = '';
  sessionCompleted: boolean = false;

  constructor(
    private moduleService: ModuleService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private location: Location,
    private alertController: AlertController,
    private toastController: ToastController
  ) {addIcons({close})}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['category']; // assuming category is passed as a parameter
      this.loadAllCategoryModules();
    });
  }

  async goBack(): Promise<void> {

      const alert = await this.alertController.create({
        header: 'Beenden',
        message: 'Möchten Sie die Lernsession wirklich beenden?',
        buttons: [
          {
            text: 'Nein',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          },
          {
            text: 'Ja',
            handler: () => {
              this.router.navigate(['/home'])
            }
          }
        ]
      });

      await alert.present();

  }

  goToHome() {
    this.router.navigate(['/card-list']);
  }

  async saveSessionProgress() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const sessionData = {
        category: this.category,
        modules: this.modules
      };
      await this.moduleService.saveSession(user.uid, sessionData).then(() => {
        console.log('Session saved successfully');
      }).catch(error => {
        console.error('Error saving session:', error);
      });
    } else {
      console.error('No user is logged in');
    }
  }

  loadAllCategoryModules() {
    this.moduleService.loadExternalModule().subscribe(data => {
      if (data && data[this.category] && data[this.category].modules) {
        this.modules = data[this.category].modules.map((module: any) => ({
          question: module.question,
          answers: this.shuffleArray(module.answers),
          correctAnswer: module.correctAnswer,
          answeredCorrectlyCount: module.answeredCorrectlyCount,
          answeredIncorrectlyCount: module.answeredIncorrectlyCount
        }));
      } else {
        console.error('No modules found for this category:', this.category);
      }
    }, error => {
      console.error('Error loading modules:', error);
    });
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async checkAnswer() {
    this.showCorrectAnswers = true;
    const currentModule = this.modules[this.currentIndex];
    if (this.selectedAnswer === currentModule.correctAnswer) {
      currentModule.answeredCorrectlyCount++;
    } else {
      currentModule.answeredIncorrectlyCount++;
    }
  }

  async nextQuestion() {
    this.showCorrectAnswers = false;
    this.selectedAnswer = '';
    if (this.currentIndex < this.modules.length - 1) {
      this.currentIndex++;
    } else {
      this.sessionCompleted = true;
      await this.saveSessionProgress();
    }
  }




}

