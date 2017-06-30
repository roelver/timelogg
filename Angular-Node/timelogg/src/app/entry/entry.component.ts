import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import * as moment from 'moment';

import { TimelineareaComponent } from './timelinearea/timelinearea.component';
import { AuthService } from '../auth/auth.service';
import { TimelogService } from '../shared/services/timelog.service';
import { UtilService } from '../shared/services/util.service';
import { Tasklog } from '../../models/tasklog';
import { IUser } from '../../models/user';
import { ITimelog } from '../../models/timelog';
import { IDaylog } from '../../models/daylog';
// import 'rxjs/Rx';
// import {Observable} from 'rxjs/Observable';
import { ErrorService } from '../shared/services/error.service';
import {Subscription} from 'rxjs/Subscription';

const styles: string = require('./entry.component.css').toString();

@Component({
  selector: 'tl-entry',
  templateUrl: 'entry.component.html',
  styles: [styles]
})

export class EntryComponent implements OnInit, OnDestroy {

   @Input()
      dt: string;

   currentDate: string; // dt in fmt YYYYMMDD

   tasklist: string[];



   currentUser: IUser;

   loadSubscription: Subscription;
    copySubscription: Subscription;

   @ViewChild('f') manualForm: NgForm;

   @Output()
      hours: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
   @Output()
      mins: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                        19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
                        36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
                        52, 53, 54, 55, 56, 57, 58, 59];

   constructor(private authService: AuthService,
               private tlogService: TimelogService,
               private errorService: ErrorService,
               private utilService: UtilService) {
   }

   ngOnInit(): void {
      this.dt = moment().format('YYYY-MM-DD');
      this.currentDate = moment().format('YYYYMMDD');
      this.tlogService.setCurrentDate(this.currentDate);
      this.currentUser = this.authService.getCurrentUser();

      this.loadSubscription = this.tlogService.daylogChanged.subscribe(() => {
        this.tasklist = this.tlogService.getTasklist();
        console.log('Update: Filtered tasklist', this.tasklist);
      });
   }

   ngOnDestroy(): void {
       this.loadSubscription.unsubscribe();
       if (this.copySubscription) {
           this.copySubscription.unsubscribe();
       }
   }

   onCopyRecent(): void {
       // Subscription is required to make the query trigger
        this.copySubscription = this.tlogService.copyPreviousDays().subscribe((data) => {
            this.tasklist = this.tlogService.getTasklist();
            console.log('Copy', data);
        });
   }

   onDateChange(newDate: string): void {
      this.dt = newDate;
      this.currentDate = newDate.replace(/-/g, '');
      console.log('New date selected', this.currentDate);
      this.tlogService.setCurrentDate(this.currentDate); // sync with service that emits the event
   }

   onSubmit(form: NgForm): void {
      const manualLog: Tasklog =
            new Tasklog(form.value.taskDesc,
                        form.value.fromHH,
                        form.value.fromMM, 0,
                        form.value.comment,
                        form.value.toHH,
                        form.value.toMM, 0);
      console.log('Manual Tasklog: ', manualLog);
      this.tlogService.addTasklog(manualLog, this.currentDate);
      this.utilService.scrollHorizontal(manualLog.fromHH);
   //   this.manualForm.reset({taskDesc: manualLog.taskDesc, fromHH: 0, fromMM: 0, toHH: 0, toMM: 0 });
   }

   onNewTask(): void {
      this.tlogService.addTask();
   }

   redrawAll(): void {
       this.tlogService.markUpdatedAll();
   }

   getStartStr(tlog: ITimelog): string {
      return this.tlogService.getStartStr(tlog);
   }
   getEndStr(tlog: ITimelog): string {
      return this.tlogService.getEndStr(tlog);
   }
   getDurationStr(tlog: ITimelog): string {
      return this.tlogService.getDurationStr(tlog);
   }
}
