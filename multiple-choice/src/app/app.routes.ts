import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {CardComponent} from "./card/card.component";
import {StatistikComponent} from "./statistik/statistik.component";
import {HomeComponent} from "./home/home.component";
import {AchivementsComponent} from "./achivements/achivements.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./login/register/register.component";
import {ForgetPasswordComponent} from "./login/forget-password/forget-password.component";
import {CardListComponent} from "./card/card-list/card-list.component";
import {CardDetailComponent} from "./card/card-detail/card-detail.component";
import {SessionStatistikComponent} from "./statistik/session-statistik/session-statistik.component";
import {SessionComponent} from "./card/session/session.component";

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'statistik', component: StatistikComponent },
  //{ path: 'card-list', component: CardListComponent },
  { path: 'achivements', component: AchivementsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'card-list', component: CardListComponent },
  { path: 'sessionStatistik', component: SessionStatistikComponent },
  { path: 'card-detail', component: CardDetailComponent },
  { path: 'session', component: SessionComponent },
  { path: '**', redirectTo: '' } // Wildcard route for a 404 page
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes,{useHash: false})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }





