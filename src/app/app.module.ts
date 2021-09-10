import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db'

const dbConfig: DBConfig  = {
  name: 'offline-chat',
  version: 1,
  objectStoresMeta: [
    {
      store: 'users',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'username', keypath: 'username', options: { unique: true } },
        { name: 'isOnline', keypath: 'isOnline', options: { unique: false } }
      ]
    },
    {
      store: "chats",
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'username', keypath: 'username', options: {unique: true} }
      ]
    }
  ]
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
