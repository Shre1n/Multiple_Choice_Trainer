import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonicModule, IonInput, NavController, ToastController} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ModuleService} from "../../services/module.service";
import {addIcons} from "ionicons";
import {close, trashSharp, addSharp} from "ionicons/icons";
import {AchievementsService} from "../../services/achievements.service";

interface Question {
  question: string;
  answers: string[];
  correctAnswers: string[];
  answeredCorrectlyCount: number;
  answeredIncorrectlyCount: number;
  correctStreak: number;
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
    correctAnswers: [],
    answeredCorrectlyCount: 0,
    answeredIncorrectlyCount: 0,
    correctStreak: 0
  };

  isEditMode: boolean = false;
  addMode = false;
  currentQuestionIndex: number | null = null;
  showQuestionList: boolean = true;
  questionCount: number = 0;
  correctIndex: number[] = [];
  settedIndex: number[] = [];

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
              private route: ActivatedRoute,
              private achievements: AchievementsService,) {
    addIcons({close,trashSharp,addSharp})
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
        this.questionCount = this.modules.length;
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

      this.moduleData.modules.push({ ...this.currentQuestion });

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
    this.currentQuestion.correctAnswers = [];
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

  setChecked(answer: string, index: number) {
    if (this.currentQuestion.correctAnswers.includes(answer)) {
      if(!this.settedIndex.includes(index)) {
        console.log("Push setted", index)
        this.correctIndex.push(index);
        this.settedIndex.push(index);
      }
      return true;
    }
    return false;
  }

  onCheckboxChange(event: any,  index: number): boolean {
    const isChecked = event.detail.checked;

    if (isChecked) {
      console.log("Push",index)
      this.correctIndex.push(index);
    } else {
      console.log("Splice",index)
      this.correctIndex.splice(this.correctIndex.indexOf(index), 1);
      console.log("Spliced correct",this.correctIndex)
    }

    return isChecked;
  }


  async saveModule() {
    this.moduleData.category = this.category;
    this.moduleData.modules.push({ ...this.currentQuestion });
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 4);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  async save(answers: string[]) {

    this.currentQuestion.correctAnswers = [];
    console.log(this.correctIndex);
    this.correctIndex.forEach(index => {
      this.currentQuestion.correctAnswers.push(answers[index]);
      console.log(this.currentQuestion.correctAnswers);
    })
    this.correctIndex = []
    this.settedIndex = []


    if (this.isEditMode) {
      await this.updateModuleInFirebase();
      await this.presentToast("Modul erfolgreich Aktualisiert!", "bottom");
      await this.navCtrl.pop();
    } else {
      await this.saveModuleToFirebase();
      const user = await this.authService.getCurrentUser();
      if (user) {
        await this.achievements.setIndexAchievement(user.uid, 6);
      }
      this.resetAnswers();
    }

  }

  async saveModuleToFirebase() {
    await this.moduleService.saveUserModulesToFirestore(this.moduleData);
  }

  async updateModuleInFirebase() {
    if (this.currentQuestionIndex !== null) {
      await this.moduleService.updateUserModuleInFirestore(this.currentQuestion, this.category, this.currentQuestionIndex);
    }
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

  selectQuestion(question: Question, index: number) {
    this.currentQuestion = question;
    this.currentQuestionIndex = index;
    this.showQuestionList = false;
  }

  handleBackButton() {
    if (this.isEditMode && !this.showQuestionList) {
      this.backToQuestionList();
    } else {
      this.navCtrl.pop();
    }
  }

  backToQuestionList() {
    this.showQuestionList = true;
  }

  navigateSelf(category:string){
    this.addMode = true;
    this.router.navigate(['/card-detail'], {queryParams: {category: category}});
  }

  async deleteQuestion(index: number) {
    const alert = await this.alertController.create({
      header: 'Frage löschen',
      message: 'Möchten Sie diese Frage wirklich löschen?',
      buttons: [
        {
          text: 'Ja',
          handler: async () => {
            this.modules.splice(index, 1);
            this.questionCount--;
            await this.moduleService.deleteQuestion(this.category, index);
            await this.presentToast("Frage erfolgreich gelöscht!", "bottom");
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Löschvorgang abgebrochen');
          }
        }
      ]
    });

    await alert.present();
  }
}
