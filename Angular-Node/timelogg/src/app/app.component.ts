import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

const styles: string = require('./app.component.css').toString();

@Component({
    selector: 'app-root',
    styles: [styles],
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

   constructor() {}

   ngOnInit(): void {
      firebase.initializeApp({
         apiKey: 'AIzaSyDLOMaZHFUutgbT4rDvnYRLMzS7VWnxNPI',
         authDomain: 'ng2-course-udemy.firebaseapp.com'
      });
   }
}
