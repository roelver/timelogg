import { Component } from "@angular/core";
const styles: string = require('./frontpage.component.css').toString();

@Component({
    styles: [styles],
    templateUrl: './frontpage.component.html'
})

export class FrontpageComponent {
    constructor() {}
}
