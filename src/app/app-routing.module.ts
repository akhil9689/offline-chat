import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "chat",
    component: ChatComponent
  },
  {
    path:"",
    redirectTo: "/login",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
