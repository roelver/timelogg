import {Component, OnInit, Input} from '@angular/core';
import { IDaylog } from '../../../models';

const styles: string = require('./timeline.component.css').toString();

@Component({
  selector: 'tl-timeline',
  templateUrl: 'timeline.component.html',
  styles: [styles]
})
export class TimelineComponent implements OnInit {

   @Input()
      idx: number;
   @Input()
      currentDate: string;
   @Input()
      myDaylog: IDaylog;

  constructor() {
  }

  ngOnInit(): void {
  }

}
