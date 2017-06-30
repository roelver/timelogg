import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { TimelineComponent } from '../timeline/timeline.component';
import { TasklineComponent } from '../taskline/taskline.component';
import { TimelogService } from '../../shared/services/timelog.service';
import { IDaylog } from '../../../models';
import {Subscription} from 'rxjs/Subscription';
import {ITimelog} from '../../../models/timelog';
// import 'rxjs/Rx';
// import {Observable} from 'rxjs/Observable';

const styles: string = require('./timelinearea.component.css').toString();

@Component({
  selector: 'tl-timeline-area',
  templateUrl: 'timelinearea.component.html',
  styles: [styles]
})

export class TimelineareaComponent implements OnInit, OnDestroy {
   @Input()
      userid: string;

   @Input()
      currentDate: string;

   allDaylogs: IDaylog[];
   daylogsChangedSubscription: Subscription;
   retrieveDaylogsSubscription: Subscription;


   constructor(private tlogService: TimelogService) {}

   ngOnInit(): void {
       this.retrieveDaylogsSubscription = this.tlogService.retrieveDaylogs().subscribe((daylogs) => {
           this.allDaylogs = daylogs;
           console.log('Daylogs retrieved', this.allDaylogs);
       });
       this.daylogsChangedSubscription = this.tlogService.daylogChanged.subscribe(() => {
           this.allDaylogs = this.tlogService.getDaylogs();
               console.log('Daylogs refreshed', this.allDaylogs);
       });
   }

   ngOnDestroy(): void {
       if (this.retrieveDaylogsSubscription) {
           this.retrieveDaylogsSubscription.unsubscribe();
       }
       if (this.daylogsChangedSubscription) {
           this.daylogsChangedSubscription.unsubscribe();
       }
   }

   // Temp. for displaying the daylogs
    getStartStr(tlog: ITimelog): string {
       return this.tlogService.getStartStr(tlog);
    }

    getEndStr(tlog: ITimelog): string {
        return this.tlogService.getEndStr(tlog);
    }

    getDurationStr(tlog: ITimelog): string {
       // To prevent and exception
        if (tlog.endTime <= 0) {
            return 'Running';
        } else {
            return this.tlogService.getDurationStr(tlog);
        }
    }
    getDirty(idx: number): string {
       return this.tlogService.getDirty(idx);
    }

}
