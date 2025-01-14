import { Component, OnInit } from '@angular/core';
import {IonicModule, AlertController, ToastController, NavController} from "@ionic/angular";
import { ModuleService } from "../../services/module.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgClass } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import {addIcons} from "ionicons";
import {AchievementsService} from "../../services/achievements.service";
import {arrowBack,addSharp,close, shareSocialOutline, checkmark} from "ionicons/icons";
import {Share} from "@capacitor/share";
import {load} from "@angular-devkit/build-angular/src/utils/server-rendering/esm-in-memory-loader/loader-hooks";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  imports: [IonicModule, FormsModule, NgClass],standalone:true
})
export class SessionComponent  implements OnInit {
  // The category of the current session
  category: string = '';
  // List of modules in the session
  modules: any[] = [];
  // Index of the current module being displayed
  currentIndex: number = 0;
  // Whether to show correct answers
  showCorrectAnswers: boolean = false;
  // The answer selected by the user
  selectedAnswers: string[] = [];
  // Whether the session is completed
  sessionCompleted: boolean = false;
  // Progress of the session
  progress: number = 0;
  // Modules with correct streak
  correctStreakModules:  { index: number; question: string; }[] = [];
  // Whether all modules are learned
  allModulesLearned: boolean = false;
  // Success rate
  rate: number = 0;


  rateText: string = "";


  constructor(
    private moduleService: ModuleService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController,
    private achievements: AchievementsService,
    private navCtrl: NavController,
    private toastController: ToastController,

  ) {addIcons({arrowBack,addSharp,close,shareSocialOutline, checkmark})}



  // Transition variables
  kartenInsgesammt: number = 0;
  kartenRichtig: number = 0;
  wrongAnswers: number = 0;

  // Load statistics
  async loadStats(){
    this.kartenInsgesammt = this.kartenRichtig + this.wrongAnswers;

    this.rate = (this.kartenRichtig / this.kartenInsgesammt) * 100;
  }

  // Initialize the component
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['category'];
      if (this.category === "") this.presentToast("No category found! :(", "middle")

      this.loadModules();
    });
  }

  // Load modules for the session
  async presentToast(message: string, position: 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: position,
    });

    await toast.present();
  }

  async loadModules() {
    await Promise.all([this.loadUserSavedModules(), this.loadAllCategoryModules()]);


    // Load correct streak modules after loading the user saved and category modules
    const correctStreakModules = await this.moduleService.getCorrectStreakOfModule(this.category);
    if (this.modules.length === correctStreakModules.length){
      this.allModulesLearned = true;
      this.sessionCompleted = true;
    }

    if (correctStreakModules.some(module => module.index === this.currentIndex)) {
      this.modules.splice(this.currentIndex, correctStreakModules.length);
    }

    if (this.modules.length === 0) {
      console.error('No modules found for this category:', this.category);
    }
  }

  // Go back to the previous page
  async goBack(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Session verlassen',
      message: 'Möchten Sie die Lernsession wirklich beenden?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Beenden',
          handler: () => {
            this.router.navigate(['/home']);
            this.navCtrl.pop();
          }
        }
      ]});
    await alert.present();
  }

  // Share the user's stats
  shareMyStats(category: string){
    let msgText = `Hallo,\ndas ist meine Statistik zu ${category}:\nKarten Insgeammt: ${this.kartenInsgesammt}\nflasche Karten: ${this.wrongAnswers}\nErfolgsrate: ${this.rate}%`;
    Share.canShare().then(canShare => {
      if (canShare.value) {
        Share.share({
          title: 'Meine Statistik',
          text: msgText,
          dialogTitle: 'Statistik teilen'
        }).then((v) =>
          console.log('ok: ', v))
          .catch(err => console.log(err));
      } else {
        console.log('Error: Sharing not available!');
      }
    });
  }

  // Navigate to the home page
  goToHome() {
    this.resetSession();
    this.router.navigate(['/card-list']);
  }

  // Determine the success rate message
  successRate(): string {
    this.rateText = '\t'+`Erfolgsrate: ${this.rate.toFixed(2)}%`;
    if (this.rate < 30) {
      return "Da musst du wohl noch etwas üben :(";
    } else if (this.rate >= 30 && this.rate < 60) {
      return "Da geht doch noch mehr..";
    } else if (this.rate >= 60 && this.rate < 90) {
      return "Gut gemacht, beim nächsten Mal schaffst du bestimmt die 100%!";
    } else if (this.rate === 100) {
      return "Was für eine Runde! Teile deinen Erfolg mit anderen, um zu zeigen, was für eine Leistung du erbracht hast!";
    }
    return "Erfolgsrate konnte nicht berechnet werden.";
  }


  // Save the session progress
  async saveSessionProgress() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const sessionData = {
        category: this.category,
        modules: this.modules
      };
      await this.moduleService.saveSession(user.uid, sessionData).then(() => {
        console.log('Session saved successfully');
        this.achievements.setIndexAchievement(user.uid, 1);
        this.achievements.setIndexAchievement(user.uid, 3);
        //Toast rein machen !!
      }).catch(error => {
        console.error('Error saving session:', error);
      });
    } else {
      console.error('No user is logged in');
    }
  }

  // Load user saved modules
  loadUserSavedModules() {
    this.moduleService.getSavedModulesForUser().then((data: any[]) => {
      const foundModule = data.find(module => module.category === this.category);
      if (foundModule && foundModule.modules) {
        this.modules = foundModule.modules.map((module: any) => ({
          question: module.question,
          answers: this.shuffleArray([...module.answers]), // Use spread operator to clone array
          correctAnswers: module.correctAnswers,
          answeredCorrectlyCount: module.answeredCorrectlyCount,
          answeredIncorrectlyCount: module.answeredIncorrectlyCount,
          correctStreak: module.correctStreak
        }));
      } else {
        console.error('No modules found for this category:', this.category);
      }
    }).catch(error => {
      console.error('Error loading modules:', error);
    });
  }

  // Load all category modules from the server
  //This Category loader Only loads from Server Modules
  //Must include the loading of user saved categories for card-list
  loadAllCategoryModules() {
    this.moduleService.loadExternalModule().subscribe(data => {
      if (data && data[this.category] && data[this.category].modules) {
        this.modules = data[this.category].modules
          .filter((module: { correctStreak: number; }) => module.correctStreak < 6)
          .map((module: any) => ({
            question: module.question,
            answers: this.shuffleArray(module.answers),
            correctAnswers: module.correctAnswers,
            answeredCorrectlyCount: module.answeredCorrectlyCount,
            answeredIncorrectlyCount: module.answeredIncorrectlyCount,
            correctStreak: module.correctStreak
          }));
      } else {
        console.error('No modules found for this category:', this.category);
      }
    }, error => {
      console.error('Error loading modules:', error);
    });
  }

  // Shuffle the array of answers
  shuffleArray(array: object[]): object[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Shuffle the array of answers
  async checkAnswer() {
    this.showCorrectAnswers = true;
    const currentModule = this.modules[this.currentIndex];

    console.log("selectedAnswers", this.selectedAnswers);
    console.log("currentModule", currentModule.correctAnswers)

    console.log("dsds", JSON.stringify(this.selectedAnswers.sort())==JSON.stringify(currentModule.correctAnswers));

    if (JSON.stringify(this.selectedAnswers.sort())==JSON.stringify(currentModule.correctAnswers)) {
      currentModule.answeredCorrectlyCount++;
      this.kartenRichtig++;
      this.moduleService.setStreak(currentModule.correctStreak++);
    } else {
      currentModule.answeredIncorrectlyCount++;
      this.wrongAnswers++;
      console.log("anz falsche antworten:" + this.wrongAnswers)

      this.moduleService.setStreak(0);
    }
  }

  // sets checked box boolean for answer
  onCheckboxChange(event: any, answer: string) {
    const isChecked = event.detail.checked;
    if (isChecked) {
      this.selectedAnswers.push(answer);
    } else {
      const index = this.selectedAnswers.indexOf(answer);
      if (index > -1) {
        this.selectedAnswers.splice(index, 1);
      }
    }
  }

  // Load the next question
  async nextQuestion() {
    this.showCorrectAnswers = false;
    this.selectedAnswers = [];
    const correctStreakModules = await this.moduleService.getCorrectStreakOfModule(this.category);

    if (!this.category) {
      console.error('Category is not defined');
      return;
    }

    const indicesToRemove = correctStreakModules.map(module => module.index);
    indicesToRemove.forEach((index) => {
      this.modules.splice(index, 1);
      if (index <= this.currentIndex) {
        this.currentIndex--;
      }
    })

    if (this.currentIndex < this.modules.length - 1) {
      this.currentIndex++;
    } else {
      this.sessionCompleted = true;
      this.loadStats();
      await this.saveSessionProgress();
    }
    this.updateProgress();
  }

  // Update the session progress
  updateProgress() {
    this.progress = this.currentIndex / this.modules.length;
  }

  // Reset the session
  resetSession() {
    this.modules = [];
    this.currentIndex = 0;
    this.showCorrectAnswers = false;
    this.selectedAnswers = [];
    this.sessionCompleted = false;
    this.progress = 0;
    this.correctStreakModules = [];
    this.rate = 0;
    this.kartenInsgesammt = 0;
    this.kartenRichtig = 0;
    this.wrongAnswers = 0;
  }



  toggleCheckbox(answer: string) {
    if (this.selectedAnswers.includes(answer)) {
      this.selectedAnswers = this.selectedAnswers.filter(a => a !== answer);
    } else {
      this.selectedAnswers.push(answer);
    }
  }

  isSelected(answer: string): boolean {
    return this.selectedAnswers.includes(answer);
  }


}


