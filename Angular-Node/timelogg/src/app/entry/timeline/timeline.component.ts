import {Component, OnInit, Input} from '@angular/core';
import { IDaylog } from '../../../models';
import { TimelogService } from '../../shared/services/timelog.service';
import { TimelinebarComponent } from './timelinebar.component';
import {UtilService} from '../../shared/services/util.service';

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

    mouseOver: number = -1;

  constructor(private tlogService: TimelogService, private utilService: UtilService ) {
      console.log('Timeline constructor', this.myDaylog);
  }

  ngOnInit(): void {
  }

}
