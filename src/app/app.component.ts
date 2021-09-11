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
  }
}
