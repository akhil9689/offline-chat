import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messageForm = new FormGroup({
    message: new FormControl('',Validators.required),
  });

  username:string;
  channel:any;
  showChat:boolean = false;
  onlineUsers:Array<Object> = [];
  userChats:Array<Object> = [];
  chat:Object;
  messages:any = [];
  chatIndex:number;

  constructor(
    private router: Router,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit(): void {
    this.username = sessionStorage.getItem("username");
    if(this.username) {
      this.channel = new BroadcastChannel("offline-chat");
      this.channel.addEventListener("message",message=> {
        console.log("message",message);
        switch(message.data.action) {
          case "message": {
            if(message.data.to==this.username) {
              console.log("to",message.data.to);
              this.getUserChats();
            }
            break;
          }
          case "userAddedOrRemoved": {
            this.getOnlineUsers();
            break;
          }
          default: {
            break;
          }
        }
      })
      this.getOnlineUsers();
      this.getUserChats();
    } else {
      this.reLogin();
    }
  }

  getOnlineUsers() {
    if(this.username) {
      this.dbService.getAllByIndex("users","isOnline",IDBKeyRange.only(1))
      .subscribe((users) => {
        this.onlineUsers = users.filter(x => x["username"]!=this.username);
      })
    }
  }

  getUserChats() {
    if(this.username) {
      this.dbService.getByIndex("chats","username",this.username)
      .subscribe((chat) => {
        if(chat) {
          this.chat = chat;
          this.userChats = chat["chats"];
          if(this.chatIndex!=-1)
            this.messages = this.userChats[this.chatIndex]["messages"]
        }
      })
    }
  }

  sendMessage() {
    if(this.messageForm.valid) {
      this.messages.push({from:this.username,message:this.messageForm.value.message})
      this.userChats[this.chatIndex]["messages"] = this.messages;
      this.chat["chats"] = this.userChats;
      this.dbService.update("chats",this.chat)
      .subscribe((chat) => {
        this.chat = chat[chat.findIndex(x=>x["username"]==this.username)];
        this.dbService.getByIndex("chats","username",this.userChats[this.chatIndex]["user"])
        .subscribe((chat) => {
          if(chat) {
            let userIndex = chat["chats"].findIndex(x=>x.user==this.username);
            if(userIndex>-1) {
              chat["chats"][userIndex].messages.push({
                from:this.username,
                message: this.messageForm.value.message
              });
              this.dbService.update("chats",chat)
              .subscribe((chat) => {
                this.channel.postMessage({
                  action:"message",
                  from:this.username,
                  to:this.userChats[this.chatIndex]["user"],
                  message:this.messageForm.value.message
                });
                this.messageForm.get("message").reset();
              })
            } else {
              chat["chats"].push({
                "user":this.username,
                "messages": [
                  {
                    from:this.username,
                    message: this.messageForm.value.message
                  }
                ]
              });
              this.dbService.update("chats",chat)
              .subscribe((chat) => {
                this.channel.postMessage({
                  action:"message",
                  from:this.username,
                  to:this.userChats[this.chatIndex]["user"],
                  message:this.messageForm.value.message
                });
                this.messageForm.get("message").reset();
              })
            }
          } else {
            chat = {
              "username":this.userChats[this.chatIndex]["user"],
              "chats":[
                {
                  "user":this.username,
                  "messages": [
                    {
                      from:this.username,
                      message: this.messageForm.value.message
                    }
                  ]
                }
              ]
            };
            this.dbService.update("chats",chat)
            .subscribe((chat) => {
              this.channel.postMessage({
                action:"message",
                from:this.username,
                to:this.userChats[this.chatIndex]["user"],
                message:this.messageForm.value.message
              });
              this.messageForm.get("message").reset();
            })
          }
        })
      })
    }
  }

  logout() {
    if(this.username) {
      sessionStorage.clear();
      this.dbService.getByIndex("users","username",this.username)
      .subscribe((user) => {
        if(user) {
          user["isOnline"] = 0;
          this.dbService.update("users", user)
          .subscribe((data)=> {
            this.channel.postMessage({action:"userAddedOrRemoved"});
            this.router.navigateByUrl("/login");
          })
        }
      })
    } else {
      this.router.navigateByUrl("/login");
    }
  }

  reLogin() {
    this.router.navigateByUrl("/login");
    alert("Session Expired. Please re-login");
  }

  clickedChatUser(chat, index) {
    this.showChat = true;
    this.messages = chat.messages;
    this.chatIndex = index;
  }

  clickedOnlineUser(user) {
    if(this.chat) {
      let index = this.chat["chats"].findIndex(x=>x.user == user.username);
      if(index>-1) {
        this.userChats = this.chat["chats"];
        let userIndex = this.userChats.findIndex(x=>x["user"]==user.username)
        this.messages = this.userChats[userIndex]["messages"];
        this.chatIndex = userIndex;
      } else {
        this.chat["chats"].push({"user":user.username,"messages":[]});
        this.userChats = this.chat["chats"];
        let userIndex = this.userChats.findIndex(x=>x["user"]==user.username)
        this.messages = this.userChats[userIndex]["messages"];
        this.chatIndex = userIndex;
      }
    } else {
      this.chat = {
        "username":this.username,
        "chats": [
          {
            "user": user.username,
            "messages": []
          }
        ]
      };
      this.userChats = this.chat["chats"];
      this.messages = this.userChats[0]["messages"];
      this.chatIndex = 0;
    }
    this.showChat = true;
  }

}
