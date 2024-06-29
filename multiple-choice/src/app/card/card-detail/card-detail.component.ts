import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonicModule, IonInput, NavController, ToastController} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ModuleService} from "../../services/module.service";
import {addIcons} from "ionicons";
import {alert, close} from "ionicons/icons";
import {catchError} from "rxjs";

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

  isEditMode: boolean = false;
  addMode = false;
  showQuestionList: boolean = true;


  #IonInput: IonInput | undefined;
  @ViewChild( IonInput)
  set IonInput(II: IonInput) {
    if (II) {
      II.setFocus();
      this.#IonInput =II;
    }
    setTimeout(() => II.setFocus(), 1);
  }



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
      this.isEditMode = params['edit'] === 'true';
      // Laden der Daten für die angegebene Kategorie, falls nicht im Edit-Modus
      if (!params['edit']) {
        this.resetAnswers();
      } else {
        this.loadDataForCategory(this.category);
      }
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

  async presentToast(message: string, position: 'middle' | 'top' | 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position,
    });

    await toast.present();
  }

  async addNewQuestion(category: string) {
    // Prüfe, ob die Kategorie gesetzt ist
    if (category && category.trim() !== '') {
      // Erstelle eine neue Frage mit der aktuellen Kategorie
      const newQuestion: Question = {
        question: '',
        answers: ['', '', '', ''],
        correctAnswer: null,
        answeredCorrectlyCount: 0,
        answeredIncorrectlyCount: 0
      };

      // Füge die neue Frage zur Liste der bestehenden Module hinzu
      this.modules.push(newQuestion);

      await this.moduleService.addQuestionToCategory(category,newQuestion);

      // Setze die Anzeige für die Frage-Liste auf false, um das Formular anzuzeigen
      this.showQuestionList = false;

      // Optional: Setze die Antworten zurück
      this.resetAnswers();
    } else {
      const toast = await this.toastController.create({
        message: 'Bitte geben Sie eine gültige Kategorie ein!',
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
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
    this.moduleData.category = this.category;
    this.moduleData.modules.push({ ...this.currentQuestion });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  async save() {
    if (this.isEditMode) {
      await this.updateModuleInFirebase();
      await this.presentToast("Modul erfolgreich Aktualisiert!", "bottom")
      await this.navCtrl.pop();
    } else {
      await this.saveModuleToFirebase();
      this.resetAnswers();
    }

  }

  async saveModuleToFirebase() {
    await this.moduleService.saveUserModulesToFirestore(this.moduleData);
  }

  async updateModuleInFirebase() {
    await this.moduleService.updateUserModuleInFirestore(this.moduleData, this.category);
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

  async selectQuestion(question: Question) {
    this.currentQuestion = question;
    this.showQuestionList = false;
  }

  backToQuestionList() {
    this.showQuestionList = true;
  }

  navigateSelf(category:string){
    this.addMode = true;
    this.router.navigate(['/card-detail'], {queryParams: {category: category}});
  }
}
