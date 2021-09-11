import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  loginForm = new FormGroup({
    username: new FormControl('',Validators.required),
  });

  constructor(
    private router: Router,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit(): void {
  }

  login() {
    if(this.loginForm.valid) {
      console.log("login");
      console.log("username",this.loginForm);
      this.dbService.getByIndex("users","username",this.loginForm.value.username)
      .subscribe((user) => {
        if(user) {
          this.gotoChat(user);
        } else {
          this.dbService.addItem("users", {
            "username":this.loginForm.value.username,
            "isOnline":0
          })
          .subscribe((item)=> {
            console.log("item",item);
            this.gotoChat(item);
          })
        }
      })
    }
  }

  gotoChat(user) {
    console.log("user",user)
    user.isOnline = 1;
    this.dbService.update("users", user)
    .subscribe((data)=> {
      console.log("data",data);
      sessionStorage.setItem("username",user.username);
      let channel = new BroadcastChannel("offline-chat");
      channel.postMessage({action:"userAddedOrRemoved"});
      this.router.navigateByUrl("/chat");
    })
  }

}
