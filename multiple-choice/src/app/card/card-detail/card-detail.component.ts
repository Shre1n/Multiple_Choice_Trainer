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

  errors = new Map<string, string>();

  @ViewChild('answer')
  private answer!: IonInput;


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
    // Receive parameters from the URL
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
      this.isEditMode = params['edit'] === 'true';
      // Load data for the specified category if not in edit mode
      if (!params['edit']) {
        this.resetAnswers();
      } else {
        this.loadDataForCategory(this.category);
      }
    });

  }

  // Load data for the specified category
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

  // Add category
  addCategory() {
    this.moduleData.category = this.category;
    this.categoryAdded = true;
  }

  // Show toast message
  async presentToast(message: string, position: 'middle' | 'top' | 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position,
    });

    await toast.present();
  }

  // Reset the answers for the current question
  resetAnswers() {
    this.currentQuestion.question = '';
    this.currentQuestion.answers = ['', '', '', ''];
    this.currentQuestion.correctAnswers = [];
  }

  // Add an additional answer field (up to 6)
  addAnswerField() {
    if (this.currentQuestion.answers.length < 6) {
      this.currentQuestion.answers.push('');
    }
  }

  // Set the correct answer for the current question
  onInputChanged(index: number) {
    // Wenn der Input gelöscht wird, entferne den Index aus correctIndex
    if (this.currentQuestion.answers[index] === '') {
      const foundIndex = this.correctIndex.indexOf(index);
      if (foundIndex !== -1) {
        this.correctIndex.splice(foundIndex, 1);
      }
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


  // Save the module data
  async saveModule() {
    this.moduleData.category = this.category;
    this.moduleData.modules.push({ ...this.currentQuestion });
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 4);
    }
  }

  // Track by index for ngFor
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  // Save the module, either updating or creating a new one
  async save(answers: string[]) {
    answers.forEach((answer, i) => {
      if (!answer.trim()) {
        this.errors.set('answer' + i, 'Antwort darf nicht leer sein!');
      }
    });
    this.currentQuestion.correctAnswers = [];
    this.correctIndex.forEach(index => {
      this.currentQuestion.correctAnswers.push(answers[index]);
      console.log(this.currentQuestion.correctAnswers);
    })
    this.correctIndex = []
    this.settedIndex = []
    this.handleBackButton();

    if (this.errors.size === 0) {
      if (this.isEditMode) {
        await this.updateModuleInFirebase();
        await this.presentToast("Modul erfolgreich Aktualisiert!", "bottom");
      } else {
        await this.saveModuleToFirebase();
        const user = await this.authService.getCurrentUser();
        if (user) {
          await this.achievements.setIndexAchievement(user.uid, 6);
        }
        this.resetAnswers();
      }
      await this.navCtrl.pop();
    }

  }

  // Save module to Firebase
  async saveModuleToFirebase() {
    await this.moduleService.saveUserModulesToFirestore(this.moduleData);
  }

  // Update module in Firebase
  async updateModuleInFirebase() {
    if (this.currentQuestionIndex !== null) {
      await this.moduleService.updateUserModuleInFirestore(this.currentQuestion, this.category, this.currentQuestionIndex);
    }
  }

  // Alert to confirm canceling the current action
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

  // Select a question from the list
  selectQuestion(question: Question, index: number) {
    this.currentQuestion = question;
    this.currentQuestionIndex = index;
    this.showQuestionList = false;
  }

  // Handle the back button action
  handleBackButton() {
    if (this.isEditMode && !this.showQuestionList) {
      this.backToQuestionList();
    } else {
      this.navCtrl.pop();
    }
  }

  // Return to the question list
  backToQuestionList() {
    this.showQuestionList = true;
  }
  // Navigate to self with specified category
  navigateSelf(category:string){
    this.addMode = true;
    this.router.navigate(['/card-detail'], {queryParams: {category: category}});
  }

  // Delete a question with confirmation
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
