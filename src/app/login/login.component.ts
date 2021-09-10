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
    // let username = sessionStorage.getItem("username");
    // if(username)
    //   this.router.navigateByUrl("/chat");
    // this.dbService.getAllByIndex("users","isOnline",IDBKeyRange.)
    // .subscribe((users) => {
    //   console.log("users",users);
    // })
    this.dbService.getByIndex("chats","username",["akhil"])
    .subscribe((user) => {
      console.log("user",user);
    })
    // this.dbService.addItem("chats",{
    //   username: ["akhil","gangula"],
    //   messages: [{from:"akhil",message:"message1"},{from:"gangula",message:"message2"}]
    // })
    // .subscribe((item)=> {
    //   console.log("item",item);
    // },(err)=> {
    //   console.log("err",err);
    // })
    // this.dbService.updateByKey("users",{
    //   "isOnline": 1
    // },"isOnline")
    // .subscribe((data)=> {
    //   console.log("data",data);
    // })

    // this.dbService.update("users", {
    //   "isOnline":1,
    //   "username": "gangula",
    //   "id": 2
    // })
    // .subscribe((data)=> {
    //   console.log("data",data);
    // })
  }

  login() {
    if(this.loginForm.valid) {
      console.log("login");
      console.log("username",this.loginForm);
      this.dbService.getByIndex("users","username",this.loginForm.value.username)
      .subscribe((user) => {
        // console.log("user",user);
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
