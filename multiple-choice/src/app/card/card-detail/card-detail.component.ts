import {Component, OnInit} from '@angular/core';
import {AlertController, IonicModule, NavController, ToastController} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ModuleService} from "../../services/module.service";
import {addIcons} from "ionicons";
import {alert, close} from "ionicons/icons";
import index from "eslint-plugin-jsdoc";
import {user} from "@angular/fire/auth";


interface Question {
  question: string;
  answers: string[];
  correctAnswer: string | null;
  answeredCorrectlyCount: number;
  answeredIncorrectlyCount: number;
}

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class CardDetailComponent implements OnInit{

  category: string = '';
  categoryAdded: boolean = false;
  cancel = false;
  modules: any[] = [];
  currentQuestion: Question = {
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: null,
    answeredCorrectlyCount: 0,
    answeredIncorrectlyCount: 0
  };
  moduleData: { category: string, modules: Question[] } = { category: '', modules: [] };
  constructor(private router: Router,
              private authService: AuthService,
              private moduleService: ModuleService,
              private alertController: AlertController,
              private toastController: ToastController,
              private navCtrl:NavController,
              private route: ActivatedRoute,) {
    addIcons({close})
  }

  ngOnInit(): void {
    // Empfangen der Parameter aus der URL
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
      // Laden der Daten für die angegebene Kategorie
      this.loadDataForCategory(this.category);
    });
  }

  // Funktion zum Laden der Daten für die angegebene Kategorie
  async loadDataForCategory(category: string): Promise<void> {
    try {
      const filteredModules = await this.moduleService.getDataForUpdate(category);
      if (filteredModules.length > 0) {
        this.modules = filteredModules[0].modules;
        if (this.modules.length > 0) {
          this.currentQuestion = this.modules[0]; // Laden der ersten Frage als Beispiel
        }
      }
    } catch (error) {
      console.error('Error loading data for category:', error);
      const toast = await this.toastController.create({
        message: 'Fehler beim Laden der Daten für die Kategorie!',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  }


  addCategory() {
    this.moduleData.category = this.category;
    this.categoryAdded = true;
  }

  resetAnswers() {
    this.currentQuestion.question = '';
    this.currentQuestion.answers = ['', '', '', ''];
    this.currentQuestion.correctAnswer = null;
  }

  clearAnswer(index: number){
    this.currentQuestion.answers[index]="";
  }

  clearCategory(){
    this.category= "";
    this.categoryAdded= false;
    this.moduleData.category ="";
  }

  clearQuestion(){
    this.currentQuestion.question="";
  }

  addAnswerField() {
    if (this.currentQuestion.answers.length < 6) {
      this.currentQuestion.answers.push('');
    }
  }

  setCorrectAnswer(index: number) {
    this.currentQuestion.correctAnswer = this.currentQuestion.answers[index];
  }

  clearCurrentQuestion() {
    this.currentQuestion = {
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: null,
      answeredCorrectlyCount: 0,
      answeredIncorrectlyCount: 0
    };
  }

  async saveModule() {
    this.moduleData.modules.push({ ...this.currentQuestion });
    if (!this.categoryAdded) {
      this.categoryAdded = true;  // Make category readonly after first question is saved
    }

  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  async save() {
    await this.moduleService.saveModule(this.moduleData);
    this.resetAnswers();
  }

  async alertCancel() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const alert = await this.alertController.create({
        header: 'Abbrechen',
        message: 'Möchten Sie den Vorgang wirklich Abbrechen? Die jetzige Seite wird NICHT gespeichert!',
        buttons: [
          {
            text: 'Yes',
            role: 'yes',
            cssClass: 'secondary',
            handler: async () => {
              await this.navCtrl.pop();
              await this.router.navigate(['/home']);
            }
          },
          {
            text: 'Cancel',
            handler: async () => {
              console.log("Cancel")
            }
          }
        ]
      });

      await alert.present();
    } else {
      const toast = await this.toastController.create({
        message: 'An Unexpected Error Occurred during Cancel!',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
  }


}
