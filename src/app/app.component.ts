import { Component, OnInit } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'offline-chat';

  constructor(
    private dbService:NgxIndexedDBService
  ) {

  }

  ngOnInit() {
    let that = this;
    // window.addEventListener('beforeunload', function (e) {
    //   // e.preventDefault();
    //   // e.returnValue = '';
    //   console.log("The window is closing now!");
    //   let username = sessionStorage.getItem("username")
    //   if(username) {
    //     sessionStorage.clear();
    //     that.dbService.getByIndex("users","username",username)
    //     .subscribe((user) => {
    //       if(user) {
    //         user["isOnline"] = 0;
    //         that.dbService.update("users", user)
    //         .subscribe((data)=> {
    //           console.log("data",data);
    //         })
    //       }
    //     })
    //   }
    // });
    // window.onunload = function(){
    //   console.log("The window is closing now!");
    //   let username = sessionStorage.getItem("username")
    //   if(username) {
    //     sessionStorage.clear();
    //     this.dbService.getByIndex("users","username",username)
    //     .subscribe((user) => {
    //       if(user) {
    //         user["isOnline"] = 0;
    //         this.dbService.update("users", user)
    //         .subscribe((data)=> {
    //           console.log("data",data);
    //         })
    //       }
    //     })
    //   }
    // }
  }
}
