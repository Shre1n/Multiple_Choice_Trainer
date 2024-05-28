import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {CardComponent} from "./card/card.component";
import {StatistikComponent} from "./statistik/statistik.component";
import {HomeComponent} from "./home/home.component";
import {AchivementsComponent} from "./achivements/achivements.component";
import {RegisterSignupComponent} from "./register-signup/register-signup.component";
import {CardListComponent} from "./card/card-list/card-list.component";
import {CardDetailComponent} from "./card/card-detail/card-detail.component";

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'statistik', component: StatistikComponent },
  { path: 'cards', component: CardComponent },
  { path: 'achivements', component: AchivementsComponent },
  { path: 'register', component: RegisterSignupComponent},
  { path: 'card-list', component: CardListComponent },
  { path: 'card-detail', component: CardDetailComponent },
  { path: '**', redirectTo: '' } // Wildcard route for a 404 page
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes,{useHash: false})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }





