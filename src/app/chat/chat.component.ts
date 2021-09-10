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
        // console.log("users",users);
        this.onlineUsers = users.filter(x => x["username"]!=this.username);
        // console.log("onlineUsers",this.onlineUsers);
      })
    }
  }

  getUserChats() {
    if(this.username) {
      this.dbService.getByIndex("chats","username",this.username)
      .subscribe((chat) => {
        // console.log("chat",chat);
        if(chat) {
          this.chat = chat;
          this.userChats = chat["chats"];
          if(this.chatIndex!=-1)
            this.messages = this.userChats[this.chatIndex]["messages"]
        }
      })
    }
    // this.chat = {
    //   "username":"akhil",
    //   "chats":[
    //     {
    //       "user":"gangula",
    //       "messages": [
    //         {
    //           from:"gangula",
    //           message: "gangula"
    //         },
    //         {
    //           from:"akhil",
    //           message:"akhil"
    //         }
    //       ]
    //     }
    //   ]
    // };
    // this.userChats = this.chat["chats"];
  }

  sendMessage() {
    // console.log("form",this.messageForm);
    if(this.messageForm.valid) {
      this.messages.push({from:this.username,message:this.messageForm.value.message})
      // console.log("messages",this.messages);
      this.userChats[this.chatIndex]["messages"] = this.messages;
      // console.log("userChats",this.userChats);
      this.chat["chats"] = this.userChats;
      // console.log("chat",this.chat);
      this.dbService.update("chats",this.chat)
      .subscribe((chat) => {
        // console.log("chat",chat);
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
      // this.messageForm.get("message").reset();
      // console.log(this.messageForm.get("message"))
      // this.channel.postMessage({action:"message"});
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
            // console.log("data",data);
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
    // console.log("chat",chat);
    // console.log("index",index);
    this.showChat = true;
    this.messages = chat.messages;
    this.chatIndex = index;
  }

  clickedOnlineUser(user) {
    if(this.chat) {
      // console.log("chat",this.chat);
      // console.log("chat.chats",this.chat["chats"]);
      // console.log("user",user);
      // console.log("index",this.chat["chats"].findIndex(x=>x.user == user.username))
      let index = this.chat["chats"].findIndex(x=>x.user == user.username);
      if(index>-1) {
        this.userChats = this.chat["chats"];
        // console.log("userchats",this.userChats);
        let userIndex = this.userChats.findIndex(x=>x["user"]==user.username)
        this.messages = this.userChats[userIndex]["messages"];
        this.chatIndex = userIndex;
      } else {
        this.chat["chats"].push({"user":user.username,"messages":[]});
        this.userChats = this.chat["chats"];
        // console.log("userchats",this.userChats);
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
    // this.userChats.push({user:user.username,messages:[]});
    this.showChat = true;
  }

}
