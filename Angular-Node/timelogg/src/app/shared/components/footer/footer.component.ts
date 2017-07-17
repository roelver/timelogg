import { Component } from '@angular/core';

const styles: string = require('./footer.component.css').toString();

@Component({
  selector: 'tl-footer',
  templateUrl: 'footer.component.html',
  styles: [styles]
})
export class FooterComponent {

  constructor() {}

}
