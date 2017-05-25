import { Component, OnInit, Input } from '@angular/core';
import { TimelineComponent } from '../timeline/timeline.component';
import { TasklineComponent } from '../taskline/taskline.component';
import { TaskService } from '../../shared/services/task.service';
import { TimelogService } from '../../shared/services/timelog.service';
import { ITask, IDaylog } from '../../../models';
// import 'rxjs/Rx';
// import {Observable} from 'rxjs/Observable';

const styles: string = require('./timelinearea.component.css').toString();

@Component({
  selector: 'tl-timeline-area',
  templateUrl: 'timelinearea.component.html',
  styles: [styles]
})

export class TimelineareaComponent implements OnInit {
   @Input()
      userid: string;

   @Input()
      currentDate: string;

   @Input()
      dlogs: IDaylog[] = [];

   @Input()
      tasklist: ITask[] = [];

   constructor(private taskService: TaskService, private tlogService: TimelogService) {}

   ngOnInit(): void {}
}
