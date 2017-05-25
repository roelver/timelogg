import { Component } from "@angular/core";
const styles: string = require('./todo.component.css').toString();

@Component({
    styles: [styles],
    templateUrl: './todo.component.html'
})

export class TodoComponent {
    constructor() {}
}
