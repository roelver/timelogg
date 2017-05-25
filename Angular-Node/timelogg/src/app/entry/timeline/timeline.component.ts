import { Component, OnInit, Input} from '@angular/core';
import { IDaylog, ITask } from '../../../models';
import { TimelogService } from '../../shared/services/timelog.service';
import { TimelinebarComponent } from './timelinebar.component';

const styles: string = require('./timeline.component.css').toString();

@Component({
  selector: 'tl-timeline',
  templateUrl: 'timeline.component.html',
  styles: [styles]
})
export class TimelineComponent implements OnInit {

   @Input()
      myTask: ITask;

   @Input()
      idx: number;

  @Input()
    currentDate: string;

    myDlog: IDaylog;

    mouseOver: number = -1;

  constructor(private tlogService: TimelogService) { }

  ngOnInit(): void {
    this.syncDlog();
    this.tlogService.daylogChanged.subscribe(() => this.syncDlog());
    this.tlogService.dateChanged.subscribe(() => this.syncDlog());
  }

  syncDlog(): void {
    const logs: IDaylog[] = this.tlogService.getDaylogForTask(this.myTask.taskId);
    console.log('Sync dlogs', logs, this.myTask.taskId);
    this.myDlog = (logs && logs.length > 0 ? logs[0] : null );
  }

  getLeft(idx: number): string {
    return '' + this.tlogService.getBarLeftPosition(this.myDlog.logs[idx]) + 'px';
  }

  getWidth(idx: number): string {
    return '' + this.tlogService.getBarWidth(this.myDlog.logs[idx]) + 'px';
  }

  showDetails(idx: number): string {
    return this.tlogService.getDetails(this.myDlog.logs[idx]);
  }


}
