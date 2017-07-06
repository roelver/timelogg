import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../shared/services/timelog.service';
import { IDaylog } from '../../../models';
import { Subscription } from 'rxjs/Subscription';

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
       });
       this.daylogsChangedSubscription = this.tlogService.daylogChanged.subscribe(() => {
           this.allDaylogs = this.tlogService.getDaylogs();
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

}
