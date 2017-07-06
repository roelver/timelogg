import { Component, OnInit } from '@angular/core';

const styles: string = require('./app.component.css').toString();

@Component({
    selector: 'app-root',
    styles: [styles],
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

   constructor() {}

   ngOnInit(): void {
   }
}
